import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_RATE_LIMIT_ENV_KEY,
  DEMO_LOGIN_RATE_LIMIT_PER_EMAIL,
  DEMO_LOGIN_RATE_LIMIT_PER_IP,
  FORGOT_RATE_LIMIT_PER_EMAIL,
  FORGOT_RATE_LIMIT_PER_IP,
  LOGIN_RATE_LIMIT_PER_EMAIL,
  LOGIN_RATE_LIMIT_PER_IP,
} from "@/lib/auth/rate-limit-constants";
import {
  checkDemoLoginRateLimit,
  checkForgotPasswordRateLimit,
  checkLoginRateLimit,
  resetAuthFormRateLimitsForTests,
} from "@/lib/auth/auth-form-rate-limit";

describe("auth-form-rate-limit", () => {
  beforeEach(() => {
    resetAuthFormRateLimitsForTests();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    resetAuthFormRateLimitsForTests();
    vi.unstubAllEnvs();
  });

  it("allows login attempts under email and ip caps", () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_PER_EMAIL; i += 1) {
      expect(checkLoginRateLimit("mail-a", "1.1.1.1").allowed).toBe(true);
    }
  });

  it("blocks login when email cap is exceeded", () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_PER_EMAIL; i += 1) {
      checkLoginRateLimit("mail-a", "1.1.1.1");
    }

    const blocked = checkLoginRateLimit("mail-a", "1.1.1.1");
    expect(blocked).toEqual({ allowed: false, reason: "email" });
  });

  it("blocks login when ip cap is exceeded across emails", () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_PER_IP; i += 1) {
      expect(
        checkLoginRateLimit(`mail-${i}`, "9.9.9.9").allowed
      ).toBe(true);
    }

    const blocked = checkLoginRateLimit("mail-overflow", "9.9.9.9");
    expect(blocked).toEqual({ allowed: false, reason: "ip" });
  });

  it("keeps login email windows independent", () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_PER_EMAIL; i += 1) {
      checkLoginRateLimit("mail-a", "2.2.2.2");
    }

    expect(checkLoginRateLimit("mail-b", "2.2.2.2").allowed).toBe(true);
  });

  it("allows demo login under its higher email and ip caps", () => {
    for (let i = 0; i < DEMO_LOGIN_RATE_LIMIT_PER_EMAIL; i += 1) {
      expect(checkDemoLoginRateLimit("demo-mail", "6.6.6.6").allowed).toBe(
        true
      );
    }
  });

  it("blocks demo login when email cap is exceeded", () => {
    for (let i = 0; i < DEMO_LOGIN_RATE_LIMIT_PER_EMAIL; i += 1) {
      checkDemoLoginRateLimit("demo-mail", "6.6.6.6");
    }

    expect(checkDemoLoginRateLimit("demo-mail", "6.6.6.6")).toEqual({
      allowed: false,
      reason: "email",
    });
  });

  it("blocks demo login when ip cap is exceeded", () => {
    for (let i = 0; i < DEMO_LOGIN_RATE_LIMIT_PER_IP; i += 1) {
      expect(
        checkDemoLoginRateLimit(`demo-mail-${i}`, "7.7.7.7").allowed
      ).toBe(true);
    }

    expect(checkDemoLoginRateLimit("demo-mail-x", "7.7.7.7")).toEqual({
      allowed: false,
      reason: "ip",
    });
  });

  it("keeps demo login limiter independent from normal login", () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_PER_EMAIL; i += 1) {
      checkLoginRateLimit("shared-mail", "8.8.8.8");
    }

    expect(checkLoginRateLimit("shared-mail", "8.8.8.8")).toEqual({
      allowed: false,
      reason: "email",
    });
    expect(checkDemoLoginRateLimit("shared-mail", "8.8.8.8").allowed).toBe(
      true
    );
  });

  it("blocks forgot-password when email cap is exceeded", () => {
    for (let i = 0; i < FORGOT_RATE_LIMIT_PER_EMAIL; i += 1) {
      expect(
        checkForgotPasswordRateLimit("mail-a", "3.3.3.3").allowed
      ).toBe(true);
    }

    expect(checkForgotPasswordRateLimit("mail-a", "3.3.3.3")).toEqual({
      allowed: false,
      reason: "email",
    });
  });

  it("blocks forgot-password when ip cap is exceeded", () => {
    for (let i = 0; i < FORGOT_RATE_LIMIT_PER_IP; i += 1) {
      expect(
        checkForgotPasswordRateLimit(`mail-${i}`, "4.4.4.4").allowed
      ).toBe(true);
    }

    expect(checkForgotPasswordRateLimit("mail-x", "4.4.4.4")).toEqual({
      allowed: false,
      reason: "ip",
    });
  });

  it("always allows when AUTH_RATE_LIMIT_ENABLED is false", () => {
    vi.stubEnv(AUTH_RATE_LIMIT_ENV_KEY, "false");

    for (let i = 0; i < LOGIN_RATE_LIMIT_PER_EMAIL + 5; i += 1) {
      expect(checkLoginRateLimit("mail-a", "5.5.5.5").allowed).toBe(true);
    }

    for (let i = 0; i < FORGOT_RATE_LIMIT_PER_EMAIL + 5; i += 1) {
      expect(
        checkForgotPasswordRateLimit("mail-a", "5.5.5.5").allowed
      ).toBe(true);
    }
  });
});
