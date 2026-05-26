import { randomBytes } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

export function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () =>
    randomBytes(BACKUP_CODE_LENGTH / 2)
      .toString("hex")
      .toUpperCase()
  );
}

export async function saveBackupCodes(
  userId: string,
  codes: string[]
): Promise<void> {
  await prisma.backupCode.deleteMany({ where: { userId } });

  const data = await Promise.all(
    codes.map(async (code) => ({
      userId,
      codeHash: await hash(code, 10),
    }))
  );

  await prisma.backupCode.createMany({ data });
}

export async function verifyBackupCode(
  userId: string,
  code: string
): Promise<boolean> {
  const storedCodes = await prisma.backupCode.findMany({
    where: { userId, usedAt: null },
  });

  for (const stored of storedCodes) {
    const isMatch = await compare(code.toUpperCase(), stored.codeHash);
    if (isMatch) {
      await prisma.backupCode.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      });
      return true;
    }
  }

  return false;
}
