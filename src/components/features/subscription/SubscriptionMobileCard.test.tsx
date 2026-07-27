import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionMobileCard } from "@/components/features/subscription/SubscriptionMobileCard";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

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
    contractDate: "2026-06-12",
    nextRenewalDate: "2026-07-12",
    notifyEnabled: true,
    ...overrides,
  };
}

describe("SubscriptionMobileCard", () => {
  it("タイトルにサブスク名とプラン名を連結して表示する", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    expect(
      screen.getByRole("heading", { name: "Amazon Prime" })
    ).toBeInTheDocument();
  });

  it("MONTHLY は月額プラン、YEARLY は年額プラン（年額払い）を表示する", () => {
    const { rerender } = render(
      <SubscriptionMobileCard subscription={buildSubscription()} />
    );
    expect(screen.getByText("月額プラン")).toBeInTheDocument();

    rerender(
      <SubscriptionMobileCard
        subscription={buildSubscription({ paymentPlan: "YEARLY" })}
      />
    );
    expect(screen.getByText("年額プラン（年額払い）")).toBeInTheDocument();
  });

  it("お知らせ ON/OFF を表示する", () => {
    const { rerender } = render(
      <SubscriptionMobileCard subscription={buildSubscription()} />
    );
    expect(screen.getByText("ON")).toBeInTheDocument();

    rerender(
      <SubscriptionMobileCard
        subscription={buildSubscription({ notifyEnabled: false })}
      />
    );
    expect(screen.getByText("OFF")).toBeInTheDocument();
  });

  it("料金行に月額と年換算を表示する", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    expect(screen.getByText("￥590")).toBeInTheDocument();
    expect(screen.getByText("￥7,080")).toBeInTheDocument();
    expect(screen.getByText(/年換算：/)).toBeInTheDocument();
  });

  it("契約日・次回更新日を YYYY/MM/DD で表示する", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    expect(
      screen.getByText((_, element) => {
        return element?.textContent === "次回更新日：2026/07/12";
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return element?.textContent === "契　約　日：2026/06/12";
      })
    ).toBeInTheDocument();
  });

  it("action 未指定のとき操作ボタンを出さない", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "修正" })).not.toBeInTheDocument();
  });

  it("削除 action を表示しクリックで onClick を呼ぶ", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SubscriptionMobileCard
        subscription={buildSubscription()}
        action={{ label: "削除", onClick }}
      />
    );

    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("修正 action を表示し、disabled のときクリックできない", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SubscriptionMobileCard
        subscription={buildSubscription()}
        action={{ label: "修正", onClick, disabled: true }}
      />
    );

    const button = screen.getByRole("button", { name: "修正" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
