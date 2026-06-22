import { Resend } from "resend";
import { ROUTES } from "@/lib/routes";
import {
  EMAIL_VERIFICATION_SUBJECT,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_MS,
  MAX_SEND_RETRIES,
  RETRY_BASE_DELAY_MS,
} from "@/lib/email-verification/constants";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createVerificationUrl(rawToken: string): string {
  const appUrl = process.env.AUTH_URL;
  if (!appUrl) {
    throw new Error("AUTH_URL is not configured");
  }

  const verifyUrl = new URL(ROUTES.verifyEmail, appUrl);
  verifyUrl.searchParams.set("token", rawToken);
  return verifyUrl.toString();
}

export async function sendEmailVerificationEmail(
  email: string,
  rawToken: string
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!emailFrom) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const resend = new Resend(resendApiKey);
  const verifyUrl = createVerificationUrl(rawToken);
  const expiryHours = EMAIL_VERIFICATION_TOKEN_EXPIRY_MS / (60 * 60 * 1000);

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_SEND_RETRIES; attempt++) {
    try {
      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject: EMAIL_VERIFICATION_SUBJECT,
        text: `メールアドレスの確認を完了するには、以下のリンクを${expiryHours}時間以内に開いてください。\n\n${verifyUrl}`,
      });
      return;
    } catch (error) {
      lastError = error;

      if (attempt < MAX_SEND_RETRIES) {
        const delayMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
        await wait(delayMs);
      }
    }
  }

  throw lastError ?? new Error("Failed to send verification email");
}
