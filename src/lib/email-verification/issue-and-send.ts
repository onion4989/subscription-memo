import { normalizeEmail } from "@/lib/email";
import {
  auditEmailVerification,
  EMAIL_VERIFICATION_AUDIT_EVENTS,
  hashEmailForAudit,
  type EmailVerificationReasonCode,
} from "@/lib/email-verification/audit-log";
import { checkEmailVerificationRateLimit } from "@/lib/email-verification/rate-limit";
import { getRequestMeta } from "@/lib/email-verification/request-meta";
import { sendEmailVerificationEmail } from "@/lib/email-verification/send";
import { createEmailVerificationToken } from "@/lib/email-verification/tokens";

export type IssueAndSendResult =
  | { ok: true }
  | { ok: false; rateLimited: true }
  | { ok: false; rateLimited: false; reasonCode: EmailVerificationReasonCode };

type IssueAndSendOptions = {
  email: string;
  userId?: string;
  auditEventOk: (typeof EMAIL_VERIFICATION_AUDIT_EVENTS)[keyof typeof EMAIL_VERIFICATION_AUDIT_EVENTS];
  auditEventFailed: (typeof EMAIL_VERIFICATION_AUDIT_EVENTS)[keyof typeof EMAIL_VERIFICATION_AUDIT_EVENTS];
};

export async function issueAndSendVerificationEmail(
  options: IssueAndSendOptions
): Promise<IssueAndSendResult> {
  const email = normalizeEmail(options.email);
  const emailHash = hashEmailForAudit(email);
  const { ip, userAgent } = await getRequestMeta();

  const rate = checkEmailVerificationRateLimit(emailHash, ip);
  if (!rate.allowed) {
    auditEmailVerification(
      EMAIL_VERIFICATION_AUDIT_EVENTS.resendRateLimited,
      "warn",
      {
        emailHash,
        userId: options.userId,
        ip,
        userAgent,
        reasonCode: "RATE_LIMITED",
      }
    );
    return { ok: false, rateLimited: true };
  }

  try {
    const rawToken = await createEmailVerificationToken(email);
    await sendEmailVerificationEmail(email, rawToken);

    auditEmailVerification(options.auditEventOk, "info", {
      emailHash,
      userId: options.userId,
      ip,
      userAgent,
    });

    return { ok: true };
  } catch (error) {
    auditEmailVerification(options.auditEventFailed, "error", {
      emailHash,
      userId: options.userId,
      ip,
      userAgent,
      reasonCode: "EMAIL_PROVIDER_ERROR",
    });

    console.error("[email-verification] send failed", {
      emailHash,
      userId: options.userId,
      error: error instanceof Error ? error.message : "unknown",
    });

    return { ok: false, rateLimited: false, reasonCode: "EMAIL_PROVIDER_ERROR" };
  }
}
