import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionMobileList } from "@/components/features/subscription/SubscriptionMobileList";
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

describe("SubscriptionMobileList", () => {
  it("デフォルトは簡易表示で列見出しと主金額のみを出す", () => {
    render(
      <SubscriptionMobileList subscriptions={[buildSubscription()]} />
    );

    expect(screen.getByText("サブスクリプション名")).toBeInTheDocument();
    expect(screen.getByText("金額")).toBeInTheDocument();
    expect(screen.getByText("次回更新日")).toBeInTheDocument();
    expect(screen.getByText("Amazon Prime")).toBeInTheDocument();
    expect(document.body).toHaveTextContent("￥590 / 月");
    expect(screen.queryByText("月額プラン")).not.toBeInTheDocument();
    expect(screen.queryByText(/お知らせ：/)).not.toBeInTheDocument();
    expect(screen.queryByText(/契　約　日/)).not.toBeInTheDocument();

    const simpleRadio = screen.getByRole("radio", { name: "簡易表示" });
    const detailRadio = screen.getByRole("radio", { name: "詳細表示" });
    expect(simpleRadio).toHaveAttribute("aria-checked", "true");
    expect(detailRadio).toHaveAttribute("aria-checked", "false");
  });

  it("詳細表示に切り替えると既存カードの情報を出す", async () => {
    const user = userEvent.setup();
    render(
      <SubscriptionMobileList subscriptions={[buildSubscription()]} />
    );

    await user.click(screen.getByRole("radio", { name: "詳細表示" }));

    expect(screen.getByRole("radio", { name: "詳細表示" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(
      screen.getByRole("heading", { name: "Amazon Prime" })
    ).toBeInTheDocument();
    expect(screen.getByText("月額プラン")).toBeInTheDocument();
    expect(screen.getByText(/お知らせ：/)).toBeInTheDocument();
    expect(screen.queryByText("サブスクリプション名")).not.toBeInTheDocument();
  });

  it("guideText と onCardPress を渡すと案内文と押下可能カードを出す", () => {
    const onCardPress = vi.fn();
    render(
      <SubscriptionMobileList
        subscriptions={[buildSubscription()]}
        guideText="変更したいサブスクリプションのカードをタップしてください。"
        onCardPress={onCardPress}
      />
    );

    expect(
      screen.getByText("変更したいサブスクリプションのカードをタップしてください。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Amazon Prime を修正" })
    ).toBeInTheDocument();
  });

  it("pressActionLabel が削除のとき aria-label を削除にする", () => {
    render(
      <SubscriptionMobileList
        subscriptions={[buildSubscription()]}
        guideText="削除したいサブスクリプションのカードをタップしてください。"
        onCardPress={() => undefined}
        pressActionLabel="削除"
      />
    );

    expect(
      screen.getByText("削除したいサブスクリプションのカードをタップしてください。")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Amazon Prime を削除" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
  });

  it("YEARLY は年額表記になり、5日以内は丸アイコンを付ける", () => {
    const { container } = render(
      <SubscriptionMobileList
        subscriptions={[
          buildSubscription({
            id: "sub-year",
            name: "Netflix",
            planName: "",
            paymentPlan: "YEARLY",
            monthlyAmount: null,
            annualAmount: 7800,
            nextRenewalDate: "2026-07-12",
          }),
        ]}
      />
    );

    expect(document.body).toHaveTextContent("￥7,800 / 年");
    expect(
      container.querySelector("[data-upcoming-renewal-dot=\"3\"]")
    ).not.toBeNull();
  });
});
