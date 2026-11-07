import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DualKeyRateResult } from "@/lib/auth/rate-limit-window";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "@/lib/demo/constants";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

const {
  signIn,
  getRequestMeta,
  checkDemoLoginRateLimit,
  hashEmailForAudit,
} = vi.hoisted(() => ({
  signIn: vi.fn(),
  getRequestMeta: vi.fn(async () => ({ ip: "1.2.3.4", userAgent: "test" })),
  checkDemoLoginRateLimit: vi.fn((): DualKeyRateResult => ({ allowed: true })),
  hashEmailForAudit: vi.fn(() => "demo-email-hash"),
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    type?: string;
  },
}));

vi.mock("@/lib/auth", () => ({
  signIn,
}));

vi.mock("@/lib/email-verification/request-meta", () => ({
  getRequestMeta,
}));

vi.mock("@/lib/auth/auth-form-rate-limit", () => ({
  checkDemoLoginRateLimit,
}));

vi.mock("@/lib/email-verification/audit-log", () => ({
  hashEmailForAudit,
}));

import { AuthError } from "next-auth";
import { demoLogin } from "@/lib/actions/demo-login";
import { LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/auth/rate-limit-constants";

describe("demoLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestMeta.mockResolvedValue({ ip: "1.2.3.4", userAgent: "test" });
    checkDemoLoginRateLimit.mockReturnValue({ allowed: true });
    hashEmailForAudit.mockReturnValue("demo-email-hash");
  });

  it("returns formError and skips signIn when rate limited", async () => {
    checkDemoLoginRateLimit.mockReturnValue({
      allowed: false,
      reason: "email",
    });

    const result = await demoLogin({ success: false }, new FormData());

    expect(result).toEqual({
      success: false,
      formError: LOGIN_RATE_LIMIT_MESSAGE,
    });
    expect(checkDemoLoginRateLimit).toHaveBeenCalledWith(
      "demo-email-hash",
      "1.2.3.4"
    );
    expect(hashEmailForAudit).toHaveBeenCalledWith(DEMO_USER_EMAIL);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("signs in with demo credentials when allowed", async () => {
    signIn.mockResolvedValue(undefined);

    const result = await demoLogin({ success: false }, new FormData());

    expect(result).toEqual({ success: true });
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  });

  it("returns formError on CredentialsSignin", async () => {
    const err = new AuthError("CredentialsSignin");
    err.type = "CredentialsSignin";
    signIn.mockRejectedValue(err);

    const result = await demoLogin({ success: false }, new FormData());

    expect(result.success).toBe(false);
    expect(result.formError).toBeTruthy();
    expect(result.formError).not.toBe(LOGIN_RATE_LIMIT_MESSAGE);
  });
});
