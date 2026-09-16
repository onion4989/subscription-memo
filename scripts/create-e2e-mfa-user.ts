/**
 * MFA テスト専用アカウントを用意する（ローカル開発専用）
 * Usage: npm run e2e:create-mfa-user
 *
 * p2-mfa は MFA を有効化・解除するため、他の spec と同じアカウントを使うと
 * 並列実行時に設定画面のテストが「二段階認証は有効です」を見てしまう。
 * `.env.local` の E2E_MFA_USER_EMAIL を E2E_USER_EMAIL と別の値にしたうえで実行する。
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

loadEnvConfig(process.cwd());

const LOCAL_DATABASE_HOST_PATTERN = /@(localhost|127\.0\.0\.1)[:/]/;
const PASSWORD_MIN_LENGTH = 8;

async function main(): Promise<void> {
  const email = process.env.E2E_MFA_USER_EMAIL?.trim();
  const password = process.env.E2E_MFA_USER_PASSWORD?.trim();
  const sharedEmail = process.env.E2E_USER_EMAIL?.trim();
  const connectionString = process.env.DATABASE_URL;

  if (!email || !password) {
    throw new Error(
      "E2E_MFA_USER_EMAIL と E2E_MFA_USER_PASSWORD を .env.local に設定してください"
    );
  }

  // 同じアカウントのままだと分離の意味がないため、ここで止める
  if (email === sharedEmail) {
    throw new Error(
      "E2E_MFA_USER_EMAIL が E2E_USER_EMAIL と同じです。別のアドレスにしてください"
    );
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(
      `E2E_MFA_USER_PASSWORD は ${PASSWORD_MIN_LENGTH} 文字以上にしてください`
    );
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
    const passwordHash = await hash(password, 12);

    // 確認メールは送らずに済むよう emailVerified を入れる。MFA は必ず無効から始める
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        emailVerified: new Date(),
        totpEnabled: false,
        totpSecret: null,
      },
      update: {
        passwordHash,
        emailVerified: new Date(),
        totpEnabled: false,
        totpSecret: null,
      },
      select: { id: true },
    });

    const [deletedCodes, deletedFailures] = await prisma.$transaction([
      prisma.backupCode.deleteMany({ where: { userId: user.id } }),
      prisma.loginAttempt.deleteMany({
        where: { userId: user.id, success: false },
      }),
    ]);

    console.log(
      [
        `MFA テスト用アカウントを用意しました: ${email}`,
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
