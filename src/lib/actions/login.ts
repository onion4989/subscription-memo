"use server";

import { compare } from "bcryptjs";
import { signIn } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email";
import { LOGIN_UNVERIFIED_MESSAGE } from "@/lib/email-verification/constants";
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
