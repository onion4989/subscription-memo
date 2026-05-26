"use server";

import { signIn } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email";
import { ROUTES } from "@/lib/routes";
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

  try {
    console.log("[login action] signIn attempt", {
      email: normalizeEmail(parsed.data.email),
    });
    await signIn("credentials", {
      email: normalizeEmail(parsed.data.email),
      password: parsed.data.password,
      redirectTo: ROUTES.success,
    });
    return { success: true };
  } catch (error) {
    console.log("[login action] signIn error", {
      type: error instanceof AuthError ? error.type : "unknown",
    });
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          success: false,
          fieldErrors: {
            password: CREDENTIALS_ERROR_MESSAGE,
          },
          values: {
            email: normalizeEmail(parsed.data.email),
          },
        };
      }
    }
    throw error;
  }
}
