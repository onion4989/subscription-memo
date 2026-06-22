"use server";

import { normalizeEmail } from "@/lib/email";
import {
  RESEND_ALREADY_VERIFIED_MESSAGE,
  SIGNUP_SUCCESS_MESSAGE,
} from "@/lib/email-verification/constants";
import { EMAIL_VERIFICATION_AUDIT_EVENTS } from "@/lib/email-verification/audit-log";
import { issueAndSendVerificationEmail } from "@/lib/email-verification/issue-and-send";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export type ResendVerificationOutcome = "sent" | "alreadyVerified";

export type ResendVerificationState = {
  submitted: boolean;
  outcome: ResendVerificationOutcome | null;
  message: string;
};

export async function resendVerification(
  _prevState: ResendVerificationState,
  formData: FormData
): Promise<ResendVerificationState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      submitted: true,
      outcome: "sent",
      message: SIGNUP_SUCCESS_MESSAGE,
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.passwordHash && user.emailVerified) {
    return {
      submitted: true,
      outcome: "alreadyVerified",
      message: RESEND_ALREADY_VERIFIED_MESSAGE,
    };
  }

  if (user?.passwordHash && !user.emailVerified) {
    await issueAndSendVerificationEmail({
      email,
      userId: user.id,
      auditEventOk: EMAIL_VERIFICATION_AUDIT_EVENTS.resendOk,
      auditEventFailed: EMAIL_VERIFICATION_AUDIT_EVENTS.resendFailed,
    });
  }

  return {
    submitted: true,
    outcome: "sent",
    message: SIGNUP_SUCCESS_MESSAGE,
  };
}
