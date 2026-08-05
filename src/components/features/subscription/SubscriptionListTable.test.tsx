import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionListTable } from "@/components/features/subscription/SubscriptionListTable";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { renderWithColorTheme } from "@/test/render-with-color-theme";

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
      !el.classList.contains("p-5")
  );
}

describe("SubscriptionListTable", () => {
  it("desktop 側は全幅フレックスで、旧テーブル幅連動クラスを使わない", () => {
    const { container } = renderWithColorTheme(
      <SubscriptionListTable subscriptions={[buildSubscription()]} />
    );

    const html = container.innerHTML;
    expect(html).not.toContain("inline-grid");
    expect(html).not.toContain("--subscription-summary-min-width");

    const desktop = Array.from(container.querySelectorAll("div")).find(
      (el) =>
        el.classList.contains("hidden") &&
        el.classList.contains("w-full") &&
        el.className.includes("md:flex")
    );
    expect(desktop).toBeDefined();
  });

  it("desktop テーブルをテーブル用セクション枠で囲み中央寄せする", () => {
    const { container } = renderWithColorTheme(
      <SubscriptionListTable subscriptions={[buildSubscription()]} />
    );

    const frame = findTableSectionFrame(container);
    expect(frame).toBeDefined();
    expect(frame).toHaveClass(
      "border-2",
      "border-white",
      "pb-9",
      "flex",
      "items-center",
      "justify-center"
    );
    expect(frame?.className).toContain("bg-[var(--app-table-frame)]");
    expect(frame?.querySelector("table")).not.toBeNull();
  });

  it("モバイル側にカード、desktop 側にお知らせとサマリーを持つ", () => {
    renderWithColorTheme(
      <SubscriptionListTable subscriptions={[buildSubscription()]} />
    );

    expect(screen.getAllByText("契約数").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("heading", { name: "お知らせ" }).length).toBe(
      2
    );
    expect(
      screen.getAllByRole("heading", { name: "Amazon Prime" }).length
    ).toBeGreaterThanOrEqual(1);
  });
});
