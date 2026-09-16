import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DualKeyRateResult } from "@/lib/auth/rate-limit-window";

const {
  signIn,
  findUniqueUser,
  getRequestMeta,
  checkLoginRateLimit,
  hashEmailForAudit,
} = vi.hoisted(() => ({
  signIn: vi.fn(),
  findUniqueUser: vi.fn(),
  getRequestMeta: vi.fn(async () => ({ ip: "1.2.3.4", userAgent: "test" })),
  checkLoginRateLimit: vi.fn((): DualKeyRateResult => ({ allowed: true })),
  hashEmailForAudit: vi.fn(() => "email-hash"),
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    type?: string;
  },
}));

vi.mock("@/lib/auth", () => ({
  signIn,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUniqueUser,
    },
  },
}));

vi.mock("@/lib/email-verification/request-meta", () => ({
  getRequestMeta,
}));

vi.mock("@/lib/auth/auth-form-rate-limit", () => ({
  checkLoginRateLimit,
}));

vi.mock("@/lib/email-verification/audit-log", () => ({
  hashEmailForAudit,
}));

vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
}));

import { login } from "@/lib/actions/login";
import { LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/auth/rate-limit-constants";

function formDataWith(email: string, password: string): FormData {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

describe("login rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestMeta.mockResolvedValue({ ip: "1.2.3.4", userAgent: "test" });
    checkLoginRateLimit.mockReturnValue({ allowed: true });
    hashEmailForAudit.mockReturnValue("email-hash");
  });

  it("returns formError and skips auth when rate limited", async () => {
    checkLoginRateLimit.mockReturnValue({ allowed: false, reason: "email" });

    const result = await login(
      { success: false },
      formDataWith("user@example.com", "password123")
    );

    expect(result).toEqual({
      success: false,
      formError: LOGIN_RATE_LIMIT_MESSAGE,
      values: { email: "user@example.com" },
    });
    expect(findUniqueUser).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("continues to auth when rate limit allows", async () => {
    findUniqueUser.mockResolvedValue({
      id: "u1",
      passwordHash: "hash",
      emailVerified: new Date(),
      totpEnabled: false,
      accounts: [],
    });
    signIn.mockResolvedValue(undefined);

    await login(
      { success: false },
      formDataWith("user@example.com", "password123")
    );

    expect(checkLoginRateLimit).toHaveBeenCalledWith("email-hash", "1.2.3.4");
    expect(findUniqueUser).toHaveBeenCalled();
    expect(signIn).toHaveBeenCalled();
  });
});
