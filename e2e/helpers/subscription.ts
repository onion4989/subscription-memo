import { expect, type Page } from "@playwright/test";

/** Unique name per run to avoid colliding with existing local data. */
export function uniqueSubscriptionName(prefix = "E2E"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function openCreateSubscriptionModal(page: Page): Promise<void> {
  await page.goto("/subscriptions/new");
  await page.getByRole("button", { name: "追加" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "サブスクリプション登録", exact: true })
  ).toBeVisible();
}

export async function fillSubscriptionCreateForm(
  page: Page,
  input: {
    name: string;
    planName: string;
    paymentPlan: "月払い" | "年額払い";
    monthlyAmount: string;
    contractDate: string;
  }
): Promise<void> {
  await page.locator("#subscription-name").fill(input.name);
  await page.locator("#subscription-plan-name").fill(input.planName);
  await page.locator("#subscription-payment-plan").click();
  await page.getByRole("option", { name: input.paymentPlan }).click();
  await page.locator("#subscription-monthly").fill(input.monthlyAmount);
  await page.locator("#subscription-monthly").blur();
  await page.locator("#subscription-contract-date").fill(input.contractDate, {
    force: true,
  });
}

export async function submitSubscriptionCreate(page: Page): Promise<void> {
  await page.getByRole("button", { name: "登録する" }).click();
  // Do not match the page sr-only h1「サブスクリプション登録・変更」
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
}

/**
 * Delete table is a CSS grid without per-row wrappers.
 * Target the 削除 button that follows this name cell in the grid.
 */
export async function deleteSubscriptionByName(
  page: Page,
  name: string
): Promise<void> {
  const nameCell = page.getByText(name, { exact: true });
  await expect(nameCell).toBeVisible();

  const deleteButton = nameCell.locator(
    "xpath=following-sibling::div[.//button[normalize-space()='削除']][1]//button[normalize-space()='削除']"
  );
  await deleteButton.click();

  await expect(
    page.getByRole("heading", { name: "データ削除", exact: true })
  ).toBeVisible();
  await expect(page.getByText(`「${name}」`)).toBeVisible();

  await page.getByRole("button", { name: "削除する" }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
  await expect(page.getByText(name, { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });
}
