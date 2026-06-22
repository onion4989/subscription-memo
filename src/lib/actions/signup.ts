"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email";
import { SIGNUP_SUCCESS_MESSAGE } from "@/lib/email-verification/constants";
import { EMAIL_VERIFICATION_AUDIT_EVENTS } from "@/lib/email-verification/audit-log";
import { issueAndSendVerificationEmail } from "@/lib/email-verification/issue-and-send";
import {
  buildOAuthAccountNotLinkedDisplayMessage,
  collectKnownLinkedOAuthProviderIds,
} from "@/lib/oauth-account-not-linked";
import {
  signupFieldErrorsFromZod,
  signupSchema,
  type SignupFieldErrors,
} from "@/schemas/index";

export type SignupState = {
  success: boolean;
  message?: string;
  fieldErrors?: SignupFieldErrors;
  values?: {
    email?: string;
  };
};

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: signupFieldErrorsFromZod(parsed.error),
      values: {
        email: raw.email,
      },
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const { password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (existing?.emailVerified) {
    const linkedProviderIds = collectKnownLinkedOAuthProviderIds(
      existing.accounts
    );
    const hasOAuthOnly = linkedProviderIds.length > 0 && !existing.passwordHash;

    return {
      success: false,
      fieldErrors: {
        email: hasOAuthOnly
          ? (buildOAuthAccountNotLinkedDisplayMessage(linkedProviderIds, false) ??
            "このメールアドレスはすでに外部ログインで登録されています。登録済みの方法でログインしてください。")
          : "このメールアドレスは既に登録されています",
      },
      values: {
        email,
      },
    };
  }

  if (existing && !existing.emailVerified && existing.passwordHash) {
    await issueAndSendVerificationEmail({
      email,
      userId: existing.id,
      auditEventOk: EMAIL_VERIFICATION_AUDIT_EVENTS.resendOk,
      auditEventFailed: EMAIL_VERIFICATION_AUDIT_EVENTS.resendFailed,
    });

    return {
      success: true,
      message: SIGNUP_SUCCESS_MESSAGE,
    };
  }

  if (existing && !existing.emailVerified) {
    const linkedProviderIds = collectKnownLinkedOAuthProviderIds(
      existing.accounts
    );
    const hasOAuthOnly = linkedProviderIds.length > 0 && !existing.passwordHash;

    if (hasOAuthOnly) {
      return {
        success: false,
        fieldErrors: {
          email:
            buildOAuthAccountNotLinkedDisplayMessage(linkedProviderIds, false) ??
            "このメールアドレスはすでに外部ログインで登録されています。登録済みの方法でログインしてください。",
        },
        values: { email },
      };
    }

    return {
      success: true,
      message: SIGNUP_SUCCESS_MESSAGE,
    };
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  const sendResult = await issueAndSendVerificationEmail({
    email,
    userId: user.id,
    auditEventOk: EMAIL_VERIFICATION_AUDIT_EVENTS.signupSendOk,
    auditEventFailed: EMAIL_VERIFICATION_AUDIT_EVENTS.signupSendFailed,
  });

  if (!sendResult.ok) {
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch (rollbackError) {
      console.error("[signup] failed to rollback user after send failure", {
        userId: user.id,
        error:
          rollbackError instanceof Error ? rollbackError.message : "unknown",
      });
    }

    return {
      success: false,
      fieldErrors: {
        email: "確認メールの送信に失敗しました。しばらくしてから再度お試しください。",
      },
      values: { email },
    };
  }

  return {
    success: true,
    message: SIGNUP_SUCCESS_MESSAGE,
  };
}
