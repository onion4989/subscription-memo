import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubscriptionSummaryCards } from "@/components/features/subscription/SubscriptionSummaryCards";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

function buildSubscription(
  overrides: Partial<SavedSubscriptionRow> = {}
): SavedSubscriptionRow {
  return {
    id: "sub-1",
    name: "Amazon",
    planName: "Prime",
    paymentPlan: "MONTHLY",
    monthlyAmount: 1000,
    annualAmount: 12000,
    contractDate: "2026-01-01",
    nextRenewalDate: "2026-12-01",
    notifyEnabled: true,
    ...overrides,
  };
}

describe("SubscriptionSummaryCards", () => {
  it("3枚のカードすべてに白2px枠があり、ラッパーは全幅", () => {
    const { container } = render(
      <SubscriptionSummaryCards
        subscriptions={[buildSubscription(), buildSubscription({ id: "sub-2" })]}
      />
    );

    expect(screen.getByText("契約数")).toBeInTheDocument();
    expect(screen.getByText("月額合計")).toBeInTheDocument();
    expect(screen.getByText("年額合計")).toBeInTheDocument();

    const root = container.firstElementChild;
    expect(root).toHaveClass("w-full");

    const cards = Array.from(container.querySelectorAll(".border-2.border-white"));
    expect(cards).toHaveLength(3);
  });
});
