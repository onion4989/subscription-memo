"use server";

import { compare } from "bcryptjs";
import { signIn } from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/auth/auth-form-rate-limit";
import { LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/auth/rate-limit-constants";
import { normalizeEmail } from "@/lib/email";
import { hashEmailForAudit } from "@/lib/email-verification/audit-log";
import { LOGIN_UNVERIFIED_MESSAGE } from "@/lib/email-verification/constants";
import { getRequestMeta } from "@/lib/email-verification/request-meta";
import { prisma } from "@/lib/prisma";
import { DEFAULT_LOGIN_REDIRECT, ROUTES } from "@/lib/routes";
import {
  loginFormFieldErrorsFromZod,
  loginFormSchema,
  type LoginFormFieldErrors,
} from "@/schemas/index";
import { AuthError } from "next-auth";

const CREDENTIALS_ERROR_MESSAGE =
  "メールアドレスまたはパスワードが正しくありません";

export type LoginState = {
  success: boolean;
  /** パスワードは正しいがメール未確認のとき true */
  emailNotVerified?: boolean;
  /** フォーム上部の共通アラート（レート制限など） */
  formError?: string;
  fieldErrors?: LoginFormFieldErrors;
  values?: {
    email?: string;
  };
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: loginFormFieldErrorsFromZod(parsed.error),
      values: {
        email: raw.email,
      },
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const { password } = parsed.data;

  const { ip } = await getRequestMeta();
  const rate = checkLoginRateLimit(hashEmailForAudit(email), ip);
  if (!rate.allowed) {
    return {
      success: false,
      formError: LOGIN_RATE_LIMIT_MESSAGE,
      values: { email },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (user?.passwordHash) {
    const isValid = await compare(password, user.passwordHash);
    if (isValid && !user.emailVerified) {
      return {
        success: false,
        emailNotVerified: true,
        fieldErrors: {
          password: LOGIN_UNVERIFIED_MESSAGE,
        },
        values: { email },
      };
    }
  }

  const redirectTo =
    user?.totpEnabled === true ? ROUTES.mfaVerify : DEFAULT_LOGIN_REDIRECT;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          success: false,
          fieldErrors: {
            password: CREDENTIALS_ERROR_MESSAGE,
          },
          values: { email },
        };
      }
    }
    throw error;
  }
}
