import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOGIN_UNVERIFIED_MESSAGE } from "@/lib/email-verification/constants";

const {
  signIn,
  findUniqueUser,
  getRequestMeta,
  checkLoginRateLimit,
  hashEmailForAudit,
  comparePassword,
} = vi.hoisted(() => ({
  signIn: vi.fn(),
  findUniqueUser: vi.fn(),
  getRequestMeta: vi.fn(async () => ({ ip: "1.2.3.4", userAgent: "test" })),
  checkLoginRateLimit: vi.fn(() => ({ allowed: true as const })),
  hashEmailForAudit: vi.fn(() => "email-hash"),
  comparePassword: vi.fn(),
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
  compare: comparePassword,
}));

import { login } from "@/lib/actions/login";

function formDataWith(email: string, password: string): FormData {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

describe("login credentials precheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRequestMeta.mockResolvedValue({ ip: "1.2.3.4", userAgent: "test" });
    checkLoginRateLimit.mockReturnValue({ allowed: true });
    hashEmailForAudit.mockReturnValue("email-hash");
  });

  it("skips bcrypt when email is already verified and defers to authorize", async () => {
    findUniqueUser.mockResolvedValue({
      passwordHash: "hash",
      emailVerified: new Date(),
      totpEnabled: false,
    });
    signIn.mockResolvedValue(undefined);

    await login(
      { success: false },
      formDataWith("user@example.com", "password123")
    );

    expect(comparePassword).not.toHaveBeenCalled();
    expect(signIn).toHaveBeenCalled();
  });

  it("returns emailNotVerified only when password matches an unverified user", async () => {
    findUniqueUser.mockResolvedValue({
      passwordHash: "hash",
      emailVerified: null,
      totpEnabled: false,
    });
    comparePassword.mockResolvedValue(true);

    const result = await login(
      { success: false },
      formDataWith("user@example.com", "password123")
    );

    expect(result).toMatchObject({
      success: false,
      emailNotVerified: true,
      fieldErrors: { password: LOGIN_UNVERIFIED_MESSAGE },
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("does not claim emailNotVerified when unverified password is wrong", async () => {
    findUniqueUser.mockResolvedValue({
      passwordHash: "hash",
      emailVerified: null,
      totpEnabled: false,
    });
    comparePassword.mockResolvedValue(false);
    signIn.mockResolvedValue(undefined);

    const result = await login(
      { success: false },
      formDataWith("user@example.com", "wrong-password")
    );

    expect(result.emailNotVerified).toBeUndefined();
    expect(signIn).toHaveBeenCalled();
  });
});
