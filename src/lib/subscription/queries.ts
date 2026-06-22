import { prisma } from "@/lib/prisma";
import { utcDateToYmd } from "@/lib/subscription/renewal-date";
import type { PaymentPlanValue } from "@/lib/subscription/constants";

export type SavedSubscriptionRow = {
  id: string;
  name: string;
  planName: string;
  paymentPlan: PaymentPlanValue;
  monthlyAmount: number | null;
  annualAmount: number | null;
  contractDate: string;
  nextRenewalDate: string;
  notifyEnabled: boolean;
};

export async function getUserSubscriptions(
  userId: string
): Promise<SavedSubscriptionRow[]> {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return subscriptions.map((subscription) => ({
    id: subscription.id,
    name: subscription.name,
    planName: subscription.planName,
    paymentPlan: subscription.paymentPlan,
    monthlyAmount: subscription.monthlyAmount,
    annualAmount: subscription.annualAmount,
    contractDate: utcDateToYmd(subscription.contractDate),
    nextRenewalDate: utcDateToYmd(subscription.nextRenewalDate),
    notifyEnabled: subscription.notifyEnabled,
  }));
}

export async function getUserSubscriptionCount(userId: string): Promise<number> {
  return prisma.subscription.count({ where: { userId } });
}
