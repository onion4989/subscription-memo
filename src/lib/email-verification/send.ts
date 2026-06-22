import { sendPlainTextEmail } from "@/lib/email/smtp";
import { ROUTES } from "@/lib/routes";
import {
  EMAIL_VERIFICATION_SUBJECT,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_MS,
} from "@/lib/email-verification/constants";

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
  const verifyUrl = createVerificationUrl(rawToken);
  const expiryHours = EMAIL_VERIFICATION_TOKEN_EXPIRY_MS / (60 * 60 * 1000);

  await sendPlainTextEmail({
    to: email,
    subject: EMAIL_VERIFICATION_SUBJECT,
    text: `メールアドレスの確認を完了するには、以下のリンクを${expiryHours}時間以内に開いてください。\n\n${verifyUrl}`,
  });
}
