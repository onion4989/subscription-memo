"use server";

import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { checkForgotPasswordRateLimit } from "@/lib/auth/auth-form-rate-limit";
import { normalizeEmail } from "@/lib/email";
import { hashEmailForAudit } from "@/lib/email-verification/audit-log";
import { getRequestMeta } from "@/lib/email-verification/request-meta";
import { sendPlainTextEmail } from "@/lib/email/smtp";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";

const emailSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordState = {
  submitted: boolean;
};

const TOKEN_EXPIRY_HOURS = 1;

function createResetUrl(rawToken: string): string {
  const appUrl = process.env.AUTH_URL;
  if (!appUrl) {
    throw new Error("AUTH_URL is not configured");
  }

  const resetUrl = new URL(ROUTES.resetPassword, appUrl);
  resetUrl.searchParams.set("token", rawToken);
  return resetUrl.toString();
}

async function sendResetEmail(email: string, rawToken: string): Promise<void> {
  const resetUrl = createResetUrl(rawToken);

  await sendPlainTextEmail({
    to: email,
    subject: "パスワード再設定のご案内",
    text: `以下のリンクから1時間以内にパスワードを再設定してください。\n${resetUrl}`,
  });
}

export async function forgotPassword(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { submitted: true };
  }

  const email = normalizeEmail(parsed.data.email);
  const emailHash = hashEmailForAudit(email);
  const { ip } = await getRequestMeta();
  const rate = checkForgotPasswordRateLimit(emailHash, ip);

  // 超過時も成功画面のまま（列挙対策）。メールは送らない
  if (!rate.allowed) {
    console.info("[forgot-password] rate limited", { emailHash, ip });
    return { submitted: true };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const hasPassword = !!user.passwordHash;

    if (hasPassword && !user.emailVerified) {
      console.info("[forgot-password] skipped reset for unverified user", {
        userId: user.id,
      });
    } else if (hasPassword) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = await hash(rawToken, 10);
      const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      const createdToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expires,
        },
      });

      try {
        await sendResetEmail(email, rawToken);
      } catch (error) {
        try {
          await prisma.passwordResetToken.delete({
            where: { id: createdToken.id },
          });
        } catch (rollbackError) {
          console.error("[forgot-password] failed to rollback reset token", {
            userId: user.id,
            tokenId: createdToken.id,
            error:
              rollbackError instanceof Error
                ? rollbackError.message
                : "unknown",
          });
        }

        console.error("[forgot-password] failed to send reset email", {
          userId: user.id,
          tokenId: createdToken.id,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    } else {
      console.info("[forgot-password] skipped reset token for oauth-only user", {
        userId: user.id,
      });
    }
  }

  return { submitted: true };
}
