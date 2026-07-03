import { sendPlainTextEmail } from "@/lib/email/smtp";
import {
  buildRenewalDigestEmailText,
  RENEWAL_DIGEST_EMAIL_SUBJECT,
  type RenewalDigestLineItem,
} from "@/lib/renewal-notification/digest-email";

export async function sendRenewalDigestEmail(params: {
  to: string;
  displayName: string;
  items: RenewalDigestLineItem[];
}): Promise<void> {
  if (params.items.length === 0) {
    throw new Error("Renewal digest requires at least one subscription item");
  }

  await sendPlainTextEmail({
    to: params.to,
    subject: RENEWAL_DIGEST_EMAIL_SUBJECT,
    text: buildRenewalDigestEmailText({
      displayName: params.displayName,
      items: params.items,
    }),
  });
}
