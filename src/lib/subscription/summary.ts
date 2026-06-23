import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

export type SubscriptionSummary = {
  contractCount: number;
  monthlyTotal: number;
  annualTotal: number;
};

export function computeSubscriptionSummary(
  subscriptions: SavedSubscriptionRow[]
): SubscriptionSummary {
  return {
    contractCount: subscriptions.length,
    monthlyTotal: subscriptions.reduce(
      (sum, subscription) => sum + (subscription.monthlyAmount ?? 0),
      0
    ),
    annualTotal: subscriptions.reduce(
      (sum, subscription) => sum + (subscription.annualAmount ?? 0),
      0
    ),
  };
}
