import {
  AUTH_RATE_LIMIT_ENV_KEY,
  FORGOT_RATE_LIMIT_PER_EMAIL,
  FORGOT_RATE_LIMIT_PER_IP,
  FORGOT_RATE_WINDOW_MS,
  LOGIN_RATE_LIMIT_PER_EMAIL,
  LOGIN_RATE_LIMIT_PER_IP,
  LOGIN_RATE_WINDOW_MS,
} from "@/lib/auth/rate-limit-constants";
import {
  createDualKeyRateLimiter,
  type DualKeyRateResult,
} from "@/lib/auth/rate-limit-window";

const loginLimiter = createDualKeyRateLimiter({
  windowMs: LOGIN_RATE_WINDOW_MS,
  emailMax: LOGIN_RATE_LIMIT_PER_EMAIL,
  ipMax: LOGIN_RATE_LIMIT_PER_IP,
});

const forgotLimiter = createDualKeyRateLimiter({
  windowMs: FORGOT_RATE_WINDOW_MS,
  emailMax: FORGOT_RATE_LIMIT_PER_EMAIL,
  ipMax: FORGOT_RATE_LIMIT_PER_IP,
});

/** `AUTH_RATE_LIMIT_ENABLED=false` のときだけ無効（未設定は有効） */
export function isAuthFormRateLimitEnabled(): boolean {
  return process.env[AUTH_RATE_LIMIT_ENV_KEY] !== "false";
}

export function checkLoginRateLimit(
  emailKey: string,
  ip: string
): DualKeyRateResult {
  if (!isAuthFormRateLimitEnabled()) {
    return { allowed: true };
  }

  return loginLimiter.check(emailKey, ip);
}

export function checkForgotPasswordRateLimit(
  emailKey: string,
  ip: string
): DualKeyRateResult {
  if (!isAuthFormRateLimitEnabled()) {
    return { allowed: true };
  }

  return forgotLimiter.check(emailKey, ip);
}

/** vitest 用。本番コードから呼ばない */
export function resetAuthFormRateLimitsForTests(): void {
  loginLimiter.resetForTests();
  forgotLimiter.resetForTests();
}
