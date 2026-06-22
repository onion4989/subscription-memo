import nodemailer from "nodemailer";
import {
  MAX_SEND_RETRIES,
  RETRY_BASE_DELAY_MS,
} from "@/lib/email-verification/constants";

type PlainTextEmailParams = {
  to: string;
  subject: string;
  text: string;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getSmtpPort(): number {
  const raw = process.env.SMTP_PORT ?? "465";
  const port = Number(raw);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number");
  }

  return port;
}

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.MY_EMAIL;
  const pass = process.env.MY_PASSWORD;
  const port = getSmtpPort();

  if (!host) {
    throw new Error("SMTP_HOST is not configured");
  }

  if (!user) {
    throw new Error("MY_EMAIL is not configured");
  }

  if (!pass) {
    throw new Error("MY_PASSWORD is not configured");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPlainTextEmail(
  params: PlainTextEmailParams
): Promise<void> {
  const from = process.env.MY_EMAIL;

  if (!from) {
    throw new Error("MY_EMAIL is not configured");
  }

  const transporter = createSmtpTransporter();
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_SEND_RETRIES; attempt++) {
    try {
      await transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
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

  throw lastError ?? new Error("Failed to send email");
}
