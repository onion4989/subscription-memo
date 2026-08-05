import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionDeleteForm } from "@/components/features/subscription/SubscriptionDeleteForm";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { renderWithColorTheme } from "@/test/render-with-color-theme";

vi.mock("@/lib/actions/subscription-delete", () => ({
  deleteSubscription: vi.fn(),
}));

vi.mock("@/lib/actions/update-color-theme", () => ({
  updateColorTheme: vi.fn(async () => ({ success: true, themeId: "default" })),
}));

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

function findTableSectionFrame(container: HTMLElement): HTMLElement | undefined {
  return Array.from(container.querySelectorAll("div")).find(
    (el) =>
      el.classList.contains("border-2") &&
      el.classList.contains("border-white") &&
      el.className.includes("bg-[var(--app-table-frame)]") &&
      el.classList.contains("pb-9") &&
      el.classList.contains("px-5") &&
      el.classList.contains("md:flex") &&
      !el.classList.contains("p-5")
  );
}

describe("SubscriptionDeleteForm layout", () => {
  it("データあり時、desktop テーブル領域にテーブル用セクション枠を使う", () => {
    const { container } = renderWithColorTheme(
      <SubscriptionDeleteForm initialSaved={[buildSubscription()]} />
    );

    const frame = findTableSectionFrame(container);
    expect(frame).toBeDefined();
    expect(frame).toHaveClass("w-full", "items-center", "justify-center");
    expect(frame?.querySelector("table")).not.toBeNull();

    const html = container.innerHTML;
    expect(html).not.toContain("max-w-7xl");
  });

  it("空データ時はテーブル枠を出さず空メッセージのみ", () => {
    const { container } = renderWithColorTheme(
      <SubscriptionDeleteForm initialSaved={[]} />
    );

    expect(
      screen.getByRole("heading", { name: "登録されたデータはありません。" })
    ).toBeInTheDocument();
    expect(findTableSectionFrame(container)).toBeUndefined();
    expect(container.querySelector("table")).toBeNull();
  });
});
