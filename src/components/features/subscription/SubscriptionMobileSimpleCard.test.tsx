import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionMobileSimpleCard } from "@/components/features/subscription/SubscriptionMobileSimpleCard";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

vi.mock("@/lib/subscription/renewal-date", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/subscription/renewal-date")>();
  return {
    ...actual,
    todayYmdInJst: () => "2026-07-10",
  };
});

function buildSubscription(
  overrides: Partial<SavedSubscriptionRow> = {}
): SavedSubscriptionRow {
  return {
    id: "sub-1",
    name: "Amazon",
    planName: "Prime",
    paymentPlan: "MONTHLY",
    monthlyAmount: 590,
    annualAmount: 7080,
    contractDate: "2026-01-01",
    nextRenewalDate: "2026-12-01",
    notifyEnabled: true,
    ...overrides,
  };
}

describe("SubscriptionMobileSimpleCard", () => {
  it("onPress 未指定のとき article で min-h-[44px] を使う", () => {
    const { container } = render(
      <SubscriptionMobileSimpleCard subscription={buildSubscription()} />
    );

    const card = container.querySelector("article");
    expect(card).toHaveClass("min-h-[44px]");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("onPress を渡すとカード全体が押下可能ボタンになる", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();

    render(
      <SubscriptionMobileSimpleCard
        subscription={buildSubscription()}
        onPress={onPress}
      />
    );

    const cardButton = screen.getByRole("button", {
      name: "Amazon Prime を修正",
    });
    expect(cardButton).toHaveClass("min-h-[44px]", "active:scale-[0.98]");

    await user.click(cardButton);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("pressActionLabel が削除のとき aria-label を削除にする", () => {
    render(
      <SubscriptionMobileSimpleCard
        subscription={buildSubscription()}
        onPress={() => undefined}
        pressActionLabel="削除"
      />
    );

    expect(
      screen.getByRole("button", { name: "Amazon Prime を削除" })
    ).toBeInTheDocument();
  });
});
