import { prisma } from "@/lib/prisma";

/**
 * OAuth プロバイダはメール所有を保証するため、未確認のまま残っている場合のみ
 * emailVerified を設定する（お知らせメール送信条件と /settings 表示用）。
 */
export async function markOAuthEmailVerifiedIfNeeded(
  userId: string
): Promise<void> {
  await prisma.user.updateMany({
    where: {
      id: userId,
      email: { not: null },
      emailVerified: null,
    },
    data: { emailVerified: new Date() },
  });
}

export function isOAuthProvider(provider: string | undefined): boolean {
  return provider !== undefined && provider !== "credentials";
}
