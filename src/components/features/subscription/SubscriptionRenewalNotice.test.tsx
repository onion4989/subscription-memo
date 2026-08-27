import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubscriptionRenewalNotice } from "@/components/features/subscription/SubscriptionRenewalNotice";
import {
  subtractDaysFromYmd,
  todayYmdInJst,
} from "@/lib/subscription/renewal-date";
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
    contractDate: "2026-01-01",
    nextRenewalDate: "2026-12-01",
    notifyEnabled: true,
    ...overrides,
  };
}

function findNoticeFrame(container: HTMLElement): HTMLElement | undefined {
  return Array.from(container.querySelectorAll("div")).find(
    (el) =>
      el.classList.contains("border-2") &&
      el.classList.contains("border-white") &&
      el.classList.contains("rounded-[10px]")
  );
}

describe("SubscriptionRenewalNotice", () => {
  it("見出しは枠の外、本文コンテナにセクション枠クラスを使う", () => {
    const { container } = render(
      <SubscriptionRenewalNotice subscriptions={[]} />
    );

    const heading = screen.getByRole("heading", { name: "お知らせ" });
    expect(heading).toBeInTheDocument();

    const frame = findNoticeFrame(container);
    expect(frame).toBeDefined();
    expect(frame).toHaveClass("w-full", "rounded-[10px]");
    expect(frame?.contains(heading)).toBe(false);
  });

  it("更新間近の件があると行数が増え、空メッセージは出ない", () => {
    const today = todayYmdInJst();
    const inThreeDays = subtractDaysFromYmd(today, -3);
    const inFiveDays = subtractDaysFromYmd(today, -5);

    render(
      <SubscriptionRenewalNotice
        subscriptions={[
          buildSubscription({
            id: "a",
            name: "Amazon",
            planName: "Prime",
            nextRenewalDate: inThreeDays,
          }),
          buildSubscription({
            id: "b",
            name: "Vercel",
            planName: "Pro",
            nextRenewalDate: inFiveDays,
          }),
        ]}
      />
    );

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);

    expect(listItems[0]?.querySelector("p")?.getAttribute("aria-label")).toBe(
      "Amazon Prime は、あと3日後です。"
    );
    expect(listItems[0]?.querySelector(".md\\:hidden")?.textContent).toBe(
      "Amazon Pri…は、"
    );
    expect(
      listItems[0]?.querySelector(".hidden.md\\:inline")?.textContent
    ).toBe("Amazon Prime は、");

    expect(listItems[1]?.querySelector("p")?.getAttribute("aria-label")).toBe(
      "Vercel Pro は、あと5日後です。"
    );
    expect(listItems[1]?.querySelector(".md\\:hidden")?.textContent).toBe(
      "Vercel Proは、"
    );
    expect(screen.queryByText("次回更新日")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/現在お知らせはありません/)
    ).not.toBeInTheDocument();
  });

  it("当日の更新は「本日中」と表示する", () => {
    const today = todayYmdInJst();

    render(
      <SubscriptionRenewalNotice
        subscriptions={[
          buildSubscription({
            id: "today",
            name: "Netflix",
            planName: "Standard",
            nextRenewalDate: today,
          }),
        ]}
      />
    );

    const listItem = screen.getByRole("listitem");
    expect(listItem.querySelector("p")?.getAttribute("aria-label")).toBe(
      "Netflix Standard は、本日中です。"
    );
    expect(listItem.querySelector(".md\\:hidden")?.textContent).toBe(
      "Netflix St…は、"
    );
    expect(
      listItem.querySelector(".hidden.md\\:inline")?.textContent
    ).toBe("Netflix Standard は、");
    expect(screen.queryByText("次回更新日")).not.toBeInTheDocument();
    expect(screen.queryByText(/あと本日中/)).not.toBeInTheDocument();
  });
});
