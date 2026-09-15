import { randomBytes } from "node:crypto";
import { digestToken } from "@/lib/auth/token-digest";
import { EMAIL_VERIFICATION_TOKEN_EXPIRY_MS } from "@/lib/email-verification/constants";
import { prisma } from "@/lib/prisma";

export async function createEmailVerificationToken(
  identifier: string
): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenDigest = digestToken(rawToken);
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: {
        identifier,
        token: tokenDigest,
        expires,
      },
    }),
  ]);

  return rawToken;
}

export async function verifyEmailVerificationToken(
  rawToken: string
): Promise<
  | { ok: true; identifier: string }
  | { ok: false; reason: "TOKEN_NOT_FOUND" | "TOKEN_EXPIRED" }
> {
  const tokenDigest = digestToken(rawToken.trim());
  const row = await prisma.verificationToken.findUnique({
    where: { token: tokenDigest },
  });

  if (!row) {
    return { ok: false, reason: "TOKEN_NOT_FOUND" };
  }

  if (row.expires.getTime() <= Date.now()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: row.identifier },
    });
    return { ok: false, reason: "TOKEN_EXPIRED" };
  }

  const user = await prisma.user.findUnique({
    where: { email: row.identifier },
    select: { id: true },
  });

  if (!user) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: row.identifier },
    });
    return { ok: false, reason: "TOKEN_NOT_FOUND" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: row.identifier },
    }),
  ]);

  return { ok: true, identifier: row.identifier };
}
