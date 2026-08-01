/**
 * E2E 用アカウントの二段階認証をリセットする（ローカル開発専用）
 * Usage: npm run e2e:reset-mfa
 *
 * E2E が途中で失敗して MFA が有効なまま残ると、シークレットもバックアップコードも
 * 手元にないためテストがログインできなくなる。その状態から復旧するための手動スクリプト。
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnvConfig(process.cwd());

const LOCAL_DATABASE_HOST_PATTERN = /@(localhost|127\.0\.0\.1)[:/]/;

async function main(): Promise<void> {
  const email = process.env.E2E_MFA_USER_EMAIL?.trim();
  const connectionString = process.env.DATABASE_URL;

  if (!email) {
    throw new Error("E2E_MFA_USER_EMAIL が .env.local に設定されていません");
  }

  if (!connectionString) {
    throw new Error("DATABASE_URL が .env.local に設定されていません");
  }

  // 本番・共有環境の DB を誤って書き換えないためのガード
  if (!LOCAL_DATABASE_HOST_PATTERN.test(connectionString)) {
    throw new Error(
      "DATABASE_URL がローカル以外を指しているため中止しました。このスクリプトはローカル専用です"
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`ユーザーが見つかりません: ${email}`);
    }

    const [, deletedCodes, deletedFailures] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { totpEnabled: false, totpSecret: null },
      }),
      prisma.backupCode.deleteMany({ where: { userId: user.id } }),
      // 失敗履歴が残っているとロックアウト判定に引っかかるため合わせて消す
      prisma.loginAttempt.deleteMany({
        where: { userId: user.id, success: false },
      }),
    ]);

    console.log(
      [
        `MFA をリセットしました: ${email}`,
        `  バックアップコード削除: ${deletedCodes.count} 件`,
        `  失敗履歴削除: ${deletedFailures.count} 件`,
      ].join("\n")
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
