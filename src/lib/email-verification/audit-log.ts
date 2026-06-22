import { createHash } from "node:crypto";

export const EMAIL_VERIFICATION_AUDIT_EVENTS = {
  signupSendOk: "email_verification_signup_send_ok",
  signupSendFailed: "email_verification_signup_send_failed",
  resendOk: "email_verification_resend_ok",
  resendFailed: "email_verification_resend_failed",
  resendRateLimited: "email_verification_resend_rate_limited",
  verifyOk: "email_verification_verify_ok",
  verifyFailed: "email_verification_verify_failed",
} as const;

export type EmailVerificationReasonCode =
  | "TOKEN_EXPIRED"
  | "TOKEN_NOT_FOUND"
  | "RATE_LIMITED"
  | "EMAIL_PROVIDER_ERROR"
  | "DB_ERROR"
  | "INVALID_INPUT";

export function hashEmailForAudit(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 16);
}

type AuditPayload = {
  emailHash?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  reasonCode?: EmailVerificationReasonCode;
  requestId?: string;
};

export function auditEmailVerification(
  event: (typeof EMAIL_VERIFICATION_AUDIT_EVENTS)[keyof typeof EMAIL_VERIFICATION_AUDIT_EVENTS],
  level: "info" | "warn" | "error",
  payload: AuditPayload
): void {
  const line = JSON.stringify({
    event,
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}
