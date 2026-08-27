import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionMobileCard } from "@/components/features/subscription/SubscriptionMobileCard";
import {
  MOBILE_NOTIFY_OFF_COLOR,
  MOBILE_NOTIFY_ON_COLOR,
  MOBILE_SUBSCRIPTION_URGENT_COLOR,
  MOBILE_SUBSCRIPTION_URGENT_FG_COLOR,
} from "@/components/features/subscription/subscription-mobile-colors";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { UPCOMING_RENEWAL_CELL_COLORS } from "@/lib/subscription/renewal-upcoming-notice";

vi.mock("@/lib/subscription/renewal-date", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/subscription/renewal-date")>();
  return {
    ...actual,
    todayYmdInJst: () => "2026-07-21",
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
    contractDate: "2026-06-12",
    nextRenewalDate: "2026-08-12",
    notifyEnabled: true,
    ...overrides,
  };
}

describe("SubscriptionMobileCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    const onLabel = screen.getByText("ON");
    expect(onLabel).toBeInTheDocument();
    expect(onLabel).toHaveClass("font-bold");
    expect(onLabel).toHaveStyle({ color: MOBILE_NOTIFY_ON_COLOR });

    rerender(
      <SubscriptionMobileCard
        subscription={buildSubscription({ notifyEnabled: false })}
      />
    );
    const offLabel = screen.getByText("OFF");
    expect(offLabel).toBeInTheDocument();
    expect(offLabel).toHaveClass("font-bold");
    expect(offLabel).toHaveStyle({ color: MOBILE_NOTIFY_OFF_COLOR });
  });

  it("料金行に月額と年換算を表示する", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    expect(screen.getByText("￥590")).toBeInTheDocument();
    expect(screen.getByText("￥7,080")).toBeInTheDocument();
    expect(screen.getByText(/年換算：/)).toBeInTheDocument();
  });

  it("年換算は月額とは別行に置き、途中で折り返さない", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    const monthlyLine = screen.getByText("￥590").parentElement;
    const annualLine = screen.getByText(/年換算：/);

    expect(monthlyLine).toHaveClass("block", "whitespace-nowrap");
    expect(annualLine).toHaveClass("block", "whitespace-nowrap");
    // 2 行目の行頭を月額に揃えるため、ラベルと金額を別の flex 子要素に分ける
    expect(monthlyLine?.parentElement).toBe(annualLine.parentElement);
    // toHaveTextContent は全角スペースを詰めるため textContent を直接比べる
    expect(
      annualLine.parentElement?.previousElementSibling?.textContent
    ).toBe("料　　　金：");
  });

  it("契約日・次回更新日を YYYY/MM/DD で表示する", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    expect(
      screen.getByText((_, element) => {
        return element?.textContent === "次回更新日：2026/08/12";
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return element?.textContent === "契　約　日：2026/06/12";
      })
    ).toBeInTheDocument();
  });

  it("更新間近でないときはバッジも日付強調も出さない", () => {
    render(<SubscriptionMobileCard subscription={buildSubscription()} />);

    expect(screen.queryByText("更新間近")).not.toBeInTheDocument();
    expect(
      document.querySelector("[data-upcoming-renewal-date]")
    ).not.toBeInTheDocument();
  });

  it("5日以内のとき右上に更新間近バッジと日付背景を出す", () => {
    render(
      <SubscriptionMobileCard
        subscription={buildSubscription({ nextRenewalDate: "2026-07-26" })}
      />
    );

    const badge = document.querySelector("[data-upcoming-renewal-badge='5']");
    expect(badge).toHaveTextContent("更新間近");
    expect(badge).toBeInTheDocument();
    expect(
      screen.getByText("更新間近").closest("[data-upcoming-renewal-badge]")
    ).toHaveAttribute("data-upcoming-renewal-badge", "5");
    expect(screen.getByText("更新間近")).toHaveStyle({
      backgroundColor: UPCOMING_RENEWAL_CELL_COLORS[5],
    });

    const date = document.querySelector("[data-upcoming-renewal-date='5']");
    expect(date).toHaveTextContent("2026/07/26");
    expect(date).toHaveStyle({
      backgroundColor: UPCOMING_RENEWAL_CELL_COLORS[5],
    });
  });

  it("3日以内のときモバイル用アクセント色でバッジと日付背景を出す", () => {
    render(
      <SubscriptionMobileCard
        subscription={buildSubscription({ nextRenewalDate: "2026-07-24" })}
      />
    );

    expect(
      screen.getByText("更新間近").closest("[data-upcoming-renewal-badge]")
    ).toHaveAttribute("data-upcoming-renewal-badge", "3");
    expect(screen.getByText("更新間近")).toHaveStyle({
      backgroundColor: MOBILE_SUBSCRIPTION_URGENT_COLOR,
      color: MOBILE_SUBSCRIPTION_URGENT_FG_COLOR,
    });

    const date = document.querySelector("[data-upcoming-renewal-date='3']");
    expect(date).toHaveTextContent("2026/07/24");
    expect(date).toHaveStyle({
      backgroundColor: MOBILE_SUBSCRIPTION_URGENT_COLOR,
      color: MOBILE_SUBSCRIPTION_URGENT_FG_COLOR,
    });
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

  it("onPress を渡すとカード全体が押下可能ボタンになる", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();

    render(
      <SubscriptionMobileCard
        subscription={buildSubscription()}
        onPress={onPress}
      />
    );

    const cardButton = screen.getByRole("button", {
      name: "Amazon Prime を修正",
    });
    expect(cardButton).toHaveClass("active:scale-[0.98]");
    expect(screen.queryByRole("heading", { name: "Amazon Prime" })).toBeNull();
    expect(screen.queryByRole("button", { name: "修正" })).not.toBeInTheDocument();

    await user.click(cardButton);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("pressActionLabel が削除のとき詳細カードも削除ラベルになる", () => {
    render(
      <SubscriptionMobileCard
        subscription={buildSubscription()}
        onPress={() => undefined}
        pressActionLabel="削除"
      />
    );

    expect(
      screen.getByRole("button", { name: "Amazon Prime を削除" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
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
