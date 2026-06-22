import { randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { EMAIL_VERIFICATION_TOKEN_EXPIRY_MS } from "@/lib/email-verification/constants";

export async function createEmailVerificationToken(
  identifier: string
): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = await hash(rawToken, 10);
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: {
        identifier,
        token: tokenHash,
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
  const now = new Date();
  const tokens = await prisma.verificationToken.findMany({
    where: {
      expires: { gt: now },
    },
  });

  for (const row of tokens) {
    const isMatch = await compare(rawToken, row.token);
    if (!isMatch) continue;

    const user = await prisma.user.findUnique({
      where: { email: row.identifier },
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

  return { ok: false, reason: "TOKEN_NOT_FOUND" };
}
