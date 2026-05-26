import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function isLockedOut(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);

  const recentFailures = await prisma.loginAttempt.count({
    where: {
      userId,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  return recentFailures >= MAX_ATTEMPTS;
}

export async function recordAttempt(
  userId: string,
  success: boolean,
  ip?: string
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { userId, success, ip },
  });

  if (success) {
    await prisma.loginAttempt.deleteMany({
      where: { userId, success: false },
    });
  }
}
