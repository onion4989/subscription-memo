/**
 * デモアカウントの DB 状態を確認する（ローカル用）
 * Usage: npx tsx scripts/verify-demo-user.ts
 */
import { loadEnvConfig } from "@next/env";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "../src/lib/demo/constants";

loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL が設定されていません");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
      include: {
        subscriptions: true,
        backupCodes: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error("デモアカウントが見つかりません");
    }

    const passwordOk = await compare(DEMO_USER_PASSWORD, user.passwordHash);
    const notifyOnCount = user.subscriptions.filter(
      (subscription) => subscription.notifyEnabled
    ).length;

    console.log(
      JSON.stringify(
        {
          exists: true,
          emailVerified: user.emailVerified !== null,
          totpEnabled: user.totpEnabled,
          notifyDeliveryPaused: user.notifyDeliveryPaused,
          subscriptionCount: user.subscriptions.length,
          notifyEnabledCount: notifyOnCount,
          backupCodeCount: user.backupCodes.length,
          passwordOk,
        },
        null,
        2
      )
    );

    if (!passwordOk) {
      throw new Error("パスワード照合に失敗しました");
    }
    if (!user.emailVerified) {
      throw new Error("emailVerified が未設定です");
    }
    if (user.totpEnabled) {
      throw new Error("totpEnabled が true です");
    }
    if (!user.notifyDeliveryPaused) {
      throw new Error("notifyDeliveryPaused が false です");
    }
    if (user.subscriptions.length !== 6) {
      throw new Error(`サブスク件数が 6 ではありません: ${user.subscriptions.length}`);
    }
    if (notifyOnCount !== 0) {
      throw new Error("notifyEnabled が ON のサブスクがあります");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
