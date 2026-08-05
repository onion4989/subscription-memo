import { hash } from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import {
  DEMO_USER_DISPLAY_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "@/lib/demo/constants";
import { buildDemoSubscriptionCreateMany } from "@/lib/demo/seed-subscriptions";
import { todayYmdInJst } from "@/lib/subscription/renewal-date";

const BCRYPT_ROUNDS = 12;

export type ResetDemoAccountResult = {
  userId: string;
  email: string;
  subscriptionCount: number;
  asOfYmd: string;
};

/**
 * デモユーザーを初期状態に戻す。
 * - ユーザー upsert（確認済み・パスワード固定・通知全停止・MFA オフ）
 * - サブスクを決め打ちデータへ差し替え
 * - バックアップコード / ログイン失敗履歴を削除
 *
 * 通常ユーザーの行には触れない。
 */
export async function resetDemoAccount(
  prisma: PrismaClient,
  options?: { asOfYmd?: string; password?: string }
): Promise<ResetDemoAccountResult> {
  const asOfYmd = options?.asOfYmd ?? todayYmdInJst();
  const password = options?.password ?? DEMO_USER_PASSWORD;
  const passwordHash = await hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_DISPLAY_NAME,
      passwordHash,
      emailVerified: new Date(),
      notifyDeliveryPaused: true,
      notifyLeadDays: "FIVE_DAYS",
      notifyChannel: "EMAIL",
      totpEnabled: false,
      totpSecret: null,
      phoneNumber: null,
      avatarId: 1,
      themeId: "default",
    },
    update: {
      name: DEMO_USER_DISPLAY_NAME,
      passwordHash,
      emailVerified: new Date(),
      notifyDeliveryPaused: true,
      notifyLeadDays: "FIVE_DAYS",
      notifyChannel: "EMAIL",
      totpEnabled: false,
      totpSecret: null,
      phoneNumber: null,
      avatarId: 1,
      themeId: "default",
    },
    select: { id: true, email: true },
  });

  await prisma.$transaction([
    prisma.subscription.deleteMany({ where: { userId: user.id } }),
    prisma.backupCode.deleteMany({ where: { userId: user.id } }),
    prisma.loginAttempt.deleteMany({ where: { userId: user.id } }),
  ]);

  const rows = buildDemoSubscriptionCreateMany(user.id, asOfYmd);
  const { count } = await prisma.subscription.createMany({ data: rows });

  return {
    userId: user.id,
    email: user.email ?? DEMO_USER_EMAIL,
    subscriptionCount: count,
    asOfYmd,
  };
}
