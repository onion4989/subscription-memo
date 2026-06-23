"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import { checkSubscriptionRegisterRateLimit } from "@/lib/subscription/rate-limit";

export type DeleteSubscriptionResult =
  | { success: true }
  | { success: false; message?: string };

function revalidateSubscriptionPaths(): void {
  revalidatePath(ROUTES.subscriptions);
  revalidatePath(ROUTES.subscriptionsNew);
  revalidatePath(ROUTES.subscriptionsManage);
}

export async function deleteSubscription(
  subscriptionId: string
): Promise<DeleteSubscriptionResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, message: "認証が必要です。" };
  }

  if (!checkSubscriptionRegisterRateLimit(userId)) {
    return {
      success: false,
      message: "削除回数が多すぎます。しばらく待ってから再度お試しください。",
    };
  }

  const existing = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
  });

  if (!existing) {
    return { success: false, message: "削除対象が見つかりません。" };
  }

  await prisma.subscription.delete({
    where: { id: subscriptionId },
  });

  revalidateSubscriptionPaths();

  return { success: true };
}
