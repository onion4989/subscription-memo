import { beforeAll, describe, expect, it, vi } from "vitest";
import { Secret, TOTP } from "otpauth";
import type { Session } from "next-auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

import {
  createTotpUri,
  generateTotpSecret,
  verifyTotpToken,
} from "@/lib/mfa/totp";
import { isMfaVerificationPending } from "@/lib/auth/mfa-session";
import { isOAuthProvider } from "@/lib/auth/mark-oauth-email-verified";

function sessionUser(
  partial: Partial<Session["user"]> & { id: string; email: string }
): Session {
  return {
    expires: new Date(Date.now() + 60_000).toISOString(),
    user: {
      totpEnabled: false,
      mfaVerified: true,
      ...partial,
    },
  };
}

describe("isMfaVerificationPending (M1)", () => {
  it("is true only when totp is enabled and mfa is not verified", () => {
    expect(isMfaVerificationPending(null)).toBe(false);
    expect(
      isMfaVerificationPending(
        sessionUser({
          id: "u1",
          email: "user@example.com",
          totpEnabled: true,
          mfaVerified: false,
        })
      )
    ).toBe(true);
    expect(
      isMfaVerificationPending(
        sessionUser({
          id: "u1",
          email: "user@example.com",
          totpEnabled: true,
          mfaVerified: true,
        })
      )
    ).toBe(false);
    expect(
      isMfaVerificationPending(
        sessionUser({
          id: "u1",
          email: "user@example.com",
          totpEnabled: false,
          mfaVerified: false,
        })
      )
    ).toBe(false);
  });
});

describe("TOTP helpers (M2)", () => {
  it("generates a base32 secret and builds an otpauth URI", () => {
    const secret = generateTotpSecret();
    expect(secret.length).toBeGreaterThan(0);
    const uri = createTotpUri(secret, "user@example.com");
    expect(uri.startsWith("otpauth://totp/")).toBe(true);
    expect(uri).toContain("user%40example.com");
  });

  it("verifies a current token and rejects an invalid token", () => {
    const secret = generateTotpSecret();
    const totp = new TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    });
    const token = totp.generate();
    expect(verifyTotpToken(secret, token)).toBe(true);
    expect(verifyTotpToken(secret, "000000")).toBe(false);
  });
});

describe("isOAuthProvider (M3)", () => {
  beforeAll(() => {
    expect(typeof isOAuthProvider).toBe("function");
  });

  it("treats non-credentials providers as OAuth", () => {
    expect(isOAuthProvider(undefined)).toBe(false);
    expect(isOAuthProvider("credentials")).toBe(false);
    expect(isOAuthProvider("google")).toBe(true);
    expect(isOAuthProvider("github")).toBe(true);
  });
});
