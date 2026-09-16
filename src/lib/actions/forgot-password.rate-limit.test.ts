import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DualKeyRateResult } from "@/lib/auth/rate-limit-window";

const {
  findUniqueUser,
  createResetToken,
  sendPlainTextEmail,
  getRequestMeta,
  checkForgotPasswordRateLimit,
  hashEmailForAudit,
} = vi.hoisted(() => ({
  findUniqueUser: vi.fn(),
  createResetToken: vi.fn(),
  sendPlainTextEmail: vi.fn(),
  getRequestMeta: vi.fn(async () => ({ ip: "1.2.3.4", userAgent: "test" })),
  checkForgotPasswordRateLimit: vi.fn(
    (): DualKeyRateResult => ({ allowed: true })
  ),
  hashEmailForAudit: vi.fn(() => "email-hash"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUniqueUser,
    },
    passwordResetToken: {
      create: createResetToken,
    },
  },
}));

vi.mock("@/lib/email/smtp", () => ({
  sendPlainTextEmail,
}));

vi.mock("@/lib/email-verification/request-meta", () => ({
  getRequestMeta,
}));

vi.mock("@/lib/auth/auth-form-rate-limit", () => ({
  checkForgotPasswordRateLimit,
}));

vi.mock("@/lib/email-verification/audit-log", () => ({
  hashEmailForAudit,
}));

import { forgotPassword } from "@/lib/actions/forgot-password";

function formDataWithEmail(email: string): FormData {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

describe("forgotPassword rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_URL = "http://localhost:3000";
    getRequestMeta.mockResolvedValue({ ip: "1.2.3.4", userAgent: "test" });
    checkForgotPasswordRateLimit.mockReturnValue({ allowed: true });
    hashEmailForAudit.mockReturnValue("email-hash");
  });

  it("returns submitted success without sending when rate limited", async () => {
    checkForgotPasswordRateLimit.mockReturnValue({
      allowed: false,
      reason: "ip",
    });

    const result = await forgotPassword(
      { submitted: false },
      formDataWithEmail("user@example.com")
    );

    expect(result).toEqual({ submitted: true });
    expect(findUniqueUser).not.toHaveBeenCalled();
    expect(createResetToken).not.toHaveBeenCalled();
    expect(sendPlainTextEmail).not.toHaveBeenCalled();
  });

  it("looks up the user when rate limit allows", async () => {
    findUniqueUser.mockResolvedValue(null);

    const result = await forgotPassword(
      { submitted: false },
      formDataWithEmail("user@example.com")
    );

    expect(result).toEqual({ submitted: true });
    expect(checkForgotPasswordRateLimit).toHaveBeenCalledWith(
      "email-hash",
      "1.2.3.4"
    );
    expect(findUniqueUser).toHaveBeenCalled();
    expect(sendPlainTextEmail).not.toHaveBeenCalled();
  });
});
