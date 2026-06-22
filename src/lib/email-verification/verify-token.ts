import {
  auditEmailVerification,
  EMAIL_VERIFICATION_AUDIT_EVENTS,
  hashEmailForAudit,
} from "@/lib/email-verification/audit-log";
import { getRequestMeta } from "@/lib/email-verification/request-meta";
import { verifyEmailVerificationToken } from "@/lib/email-verification/tokens";

export type VerifyEmailResult =
  | { success: true }
  | { success: false; reason: "TOKEN_NOT_FOUND" | "TOKEN_EXPIRED" | "INVALID_INPUT" };

export async function verifyEmailFromToken(
  rawToken: string | undefined
): Promise<VerifyEmailResult> {
  if (!rawToken?.trim()) {
    return { success: false, reason: "INVALID_INPUT" };
  }

  const { ip, userAgent } = await getRequestMeta();
  const result = await verifyEmailVerificationToken(rawToken.trim());

  if (result.ok) {
    auditEmailVerification(EMAIL_VERIFICATION_AUDIT_EVENTS.verifyOk, "info", {
      emailHash: hashEmailForAudit(result.identifier),
      ip,
      userAgent,
    });
    return { success: true };
  }

  auditEmailVerification(EMAIL_VERIFICATION_AUDIT_EVENTS.verifyFailed, "warn", {
    ip,
    userAgent,
    reasonCode: result.reason,
  });

  return { success: false, reason: result.reason };
}
