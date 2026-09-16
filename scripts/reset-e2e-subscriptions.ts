/**
 * e2e が残したサブスクを掃除する（ローカル開発専用）
 * Usage: npm run e2e:reset-subs（`npm run test:e2e` の前段でも自動実行される）
 *
 * テストが途中で失敗すると作成したサブスクが消えずに残る。
 * アプリの上限（SUBSCRIPTION_MAX_ROWS）に達すると「追加」が押せなくなり、
 * 無関係なテストが失敗するため、実行前に取り除く。
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E_SUBSCRIPTION_PREFIXES } from "../e2e/helpers/subscription-names";

loadEnvConfig(process.cwd());

const LOCAL_DATABASE_HOST_PATTERN = /@(localhost|127\.0\.0\.1)[:/]/;

function readE2EEmails(): string[] {
  const emails = [
    process.env.E2E_USER_EMAIL,
    process.env.E2E_MFA_USER_EMAIL,
    process.env.E2E_SIGNUP_EMAIL,
  ];

  return emails
    .map((email) => email?.trim())
    .filter((email): email is string => Boolean(email));
}

async function main(): Promise<void> {
  const emails = readE2EEmails();
  const connectionString = process.env.DATABASE_URL;

  if (emails.length === 0) {
    throw new Error("E2E_USER_EMAIL が .env.local に設定されていません");
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
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });

    if (users.length === 0) {
      console.log("e2e 用アカウントが見つかりませんでした。掃除をとばします");
      return;
    }

    // 手で登録したデータを消さないよう、アカウントと名前の両方で絞る
    const deleted = await prisma.subscription.deleteMany({
      where: {
        userId: { in: users.map((user) => user.id) },
        OR: E2E_SUBSCRIPTION_PREFIXES.map((prefix) => ({
          name: { startsWith: `${prefix}-` },
        })),
      },
    });

    console.log(
      `e2e の残骸を削除しました: ${deleted.count} 件（対象アカウント ${users.length} 件）`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
