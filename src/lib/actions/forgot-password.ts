"use server";

import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordState = {
  submitted: boolean;
};

const TOKEN_EXPIRY_HOURS = 1;
const MAX_SEND_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 300;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createResetUrl(rawToken: string): string {
  const appUrl = process.env.AUTH_URL;
  if (!appUrl) {
    throw new Error("AUTH_URL is not configured");
  }

  const resetUrl = new URL(ROUTES.resetPassword, appUrl);
  resetUrl.searchParams.set("token", rawToken);
  return resetUrl.toString();
}

async function sendResetEmailWithRetry(
  email: string,
  rawToken: string
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!emailFrom) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const resend = new Resend(resendApiKey);
  const resetUrl = createResetUrl(rawToken);
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_SEND_RETRIES; attempt++) {
    try {
      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject: "パスワード再設定のご案内",
        text: `以下のリンクから1時間以内にパスワードを再設定してください。\n${resetUrl}`,
      });
      return;
    } catch (error) {
      lastError = error;

      if (attempt < MAX_SEND_RETRIES) {
        const delayMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
        await wait(delayMs);
      }
    }
  }

  throw lastError ?? new Error("Failed to send reset email");
}

export async function forgotPassword(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { submitted: true };
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const hasPassword = !!user.passwordHash;

    if (hasPassword) {
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
        await sendResetEmailWithRetry(email, rawToken);
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
      // OAuth専用ユーザー: 外部サービス連携である旨を通知
      // TODO: メール送信
      console.info("[forgot-password] skipped reset token for oauth-only user", {
        userId: user.id,
      });
    }
  }

  // 登録有無に関わらず同一レスポンス（列挙対策）
  return { submitted: true };
}
