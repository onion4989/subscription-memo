import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionRegistrationForm } from "@/components/features/subscription/SubscriptionRegistrationForm";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

vi.mock("@/lib/actions/subscription-register", () => ({
  registerSubscription: vi.fn(),
  updateSubscription: vi.fn(),
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
      el.classList.contains("bg-black") &&
      el.classList.contains("pt-12") &&
      el.classList.contains("md:flex")
  );
}

describe("SubscriptionRegistrationForm layout", () => {
  it("desktop テーブル領域にテーブル用セクション枠を使う", () => {
    const { container } = render(
      <SubscriptionRegistrationForm
        initialSaved={[buildSubscription()]}
      />
    );

    const frame = findTableSectionFrame(container);
    expect(frame).toBeDefined();
    expect(frame).toHaveClass("w-full", "items-center", "justify-center");
    expect(frame?.querySelector("table")).not.toBeNull();
  });

  it("枠内にガイド矢印用の relative w-max 箱と追加ボタンを持つ", () => {
    const { container } = render(
      <SubscriptionRegistrationForm
        initialSaved={[buildSubscription()]}
      />
    );

    const frame = findTableSectionFrame(container);
    expect(frame).toBeDefined();

    const guideBox = frame?.querySelector(".relative.w-max");
    expect(guideBox).not.toBeNull();
    expect(guideBox?.className).toMatch(/pr-\[60px\]|pr-15/);

    expect(
      screen.getAllByRole("button", { name: "追加" }).length
    ).toBeGreaterThanOrEqual(1);
    expect(frame?.textContent).toContain("追加");
  });
});
