/**
 * デモユーザーの作成・日次リセット
 * Usage:
 *   npm run demo:reset
 *   npm run demo:reset -- --confirm-production   # 本番 DB 向け明示確認
 *
 * Cron からも同じコア（resetDemoAccount）を呼ぶ。
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resetDemoAccount } from "../src/lib/demo/reset-demo-account";

loadEnvConfig(process.cwd());

const LOCAL_DATABASE_HOST_PATTERN = /@(localhost|127\.0\.0\.1)[:/]/;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL が設定されていません");
  }

  const confirmProduction = process.argv.includes("--confirm-production");
  const isLocal = LOCAL_DATABASE_HOST_PATTERN.test(connectionString);

  if (!isLocal && !confirmProduction) {
    throw new Error(
      "DATABASE_URL がローカル以外を指しています。本番で実行する場合は --confirm-production を付けてください"
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const result = await resetDemoAccount(prisma);
    console.log(
      [
        `デモアカウントをリセットしました: ${result.email}`,
        `  userId: ${result.userId}`,
        `  asOfYmd: ${result.asOfYmd}`,
        `  サブスク件数: ${result.subscriptionCount}`,
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
