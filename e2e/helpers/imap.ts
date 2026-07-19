import { ImapFlow } from "imapflow";

const EMAIL_VERIFICATION_SUBJECT = "メールアドレスの確認";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set in .env.local`);
  }
  return value;
}

function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    );
}

function extractVerifyUrl(source: string): string | null {
  const decoded = decodeQuotedPrintable(source)
    .replace(/&amp;/g, "&")
    .replace(/=\s*\n/g, "");

  const match = decoded.match(
    /https?:\/\/[^\s"'<>]+\/verify-email\?token=[A-Za-z0-9_-]+/
  );
  return match?.[0] ?? null;
}

async function findVerificationLinkOnce(
  expectedTo: string
): Promise<string | null> {
  const client = new ImapFlow({
    host: requireEnv("E2E_IMAP_HOST"),
    port: Number(requireEnv("E2E_IMAP_PORT")),
    secure: true,
    auth: {
      user: requireEnv("E2E_IMAP_USER"),
      pass: requireEnv("E2E_IMAP_PASSWORD"),
    },
    logger: false,
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    const since = new Date(Date.now() - 15 * 60 * 1000);
    const uids = await client.search({
      subject: EMAIL_VERIFICATION_SUBJECT,
      since,
    });

    if (!uids || uids.length === 0) {
      return null;
    }

    // Newest first
    const ordered = [...uids].sort((a, b) => b - a);

    for (const uid of ordered) {
      const message = await client.fetchOne(uid, {
        source: true,
        envelope: true,
      });
      if (!message?.source) {
        continue;
      }

      const source = message.source.toString("utf8");
      const envelopeTo = (message.envelope?.to ?? [])
        .map((addr) => `${addr.mailbox ?? ""}@${addr.host ?? ""}`)
        .join(" ");

      if (
        !source.includes(expectedTo) &&
        !envelopeTo.includes(expectedTo) &&
        !source.toLowerCase().includes(expectedTo.toLowerCase())
      ) {
        continue;
      }

      const url = extractVerifyUrl(source);
      if (url) {
        await client.messageFlagsAdd(uid, ["\\Seen"]);
        return url;
      }
    }

    return null;
  } finally {
    try {
      await client.logout();
    } catch {
      // ignore logout errors
    }
  }
}

/** Poll IMAP until the signup verification mail for `expectedTo` arrives. */
export async function waitForVerificationLink(
  expectedTo: string,
  timeoutMs = 90_000
): Promise<string> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const link = await findVerificationLinkOnce(expectedTo);
    if (link) {
      return link;
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }

  throw new Error(
    `Verification email for ${expectedTo} not found within ${timeoutMs}ms`
  );
}

export function uniqueSignupEmail(baseEmail: string): string {
  const at = baseEmail.lastIndexOf("@");
  if (at <= 0) {
    throw new Error(`Invalid E2E_SIGNUP_EMAIL: ${baseEmail}`);
  }
  const local = baseEmail.slice(0, at);
  const domain = baseEmail.slice(at + 1);
  return `${local}+e2e-${Date.now()}@${domain}`;
}
