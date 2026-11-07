"use server";

import { signIn } from "@/lib/auth";
import { checkDemoLoginRateLimit } from "@/lib/auth/auth-form-rate-limit";
import { LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/auth/rate-limit-constants";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "@/lib/demo/constants";
import { hashEmailForAudit } from "@/lib/email-verification/audit-log";
import { getRequestMeta } from "@/lib/email-verification/request-meta";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";
import { AuthError } from "next-auth";

const DEMO_LOGIN_FAILED_MESSAGE =
  "デモログインに失敗しました。しばらくしてから再度お試しください。";

export type DemoLoginState = {
  success: boolean;
  formError?: string;
};

export async function demoLogin(
  prevState: DemoLoginState,
  formData: FormData
): Promise<DemoLoginState> {
  void prevState;
  void formData;

  const { ip } = await getRequestMeta();
  const rate = checkDemoLoginRateLimit(
    hashEmailForAudit(DEMO_USER_EMAIL),
    ip
  );
  if (!rate.allowed) {
    return {
      success: false,
      formError: LOGIN_RATE_LIMIT_MESSAGE,
    };
  }

  try {
    await signIn("credentials", {
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          success: false,
          formError: DEMO_LOGIN_FAILED_MESSAGE,
        };
      }
    }
    throw error;
  }
}
