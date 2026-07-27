import { expect, type Locator, type Page } from "@playwright/test";

/** Unique name per run to avoid colliding with existing local data. */
export function uniqueSubscriptionName(prefix = "E2E"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/** Prefer visible nodes — mobile cards and desktop table both exist in the DOM. */
export function visibleGetByText(
  page: Page,
  text: string | RegExp,
  options?: Parameters<Page["getByText"]>[1]
): Locator {
  return page.getByText(text, options).filter({ visible: true });
}

export async function openCreateSubscriptionModal(page: Page): Promise<void> {
  await page.goto("/subscriptions/new");
  await page
    .getByRole("button", { name: "追加" })
    .filter({ visible: true })
    .click();
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
 * Desktop: transposed table — find the column whose header is `name`,
 * then click 削除 in that same column's action row.
 * (Playwright project is Desktop Chrome; mobile cards are out of scope here.)
 */
export async function deleteSubscriptionByName(
  page: Page,
  name: string
): Promise<void> {
  const table = page
    .locator("table")
    .filter({ visible: true })
    .filter({
      has: page.getByRole("columnheader", { name, exact: true }),
    });
  await expect(table).toBeVisible();

  const headerCells = table.locator("thead th");
  const headerCount = await headerCells.count();
  let columnIndex = -1;

  for (let index = 0; index < headerCount; index += 1) {
    const text = (await headerCells.nth(index).innerText()).trim();
    if (text === name) {
      columnIndex = index;
      break;
    }
  }

  expect(
    columnIndex,
    `column header for subscription "${name}" was not found`
  ).toBeGreaterThanOrEqual(0);

  const deleteButton = table
    .locator("tbody tr")
    .last()
    .locator(":scope > *")
    .nth(columnIndex)
    .getByRole("button", { name: "削除" });

  await deleteButton.click();

  await expect(
    page.getByRole("heading", { name: "データ削除", exact: true })
  ).toBeVisible();
  await expect(page.getByText(`「${name}」`)).toBeVisible();

  await page.getByRole("button", { name: "削除する" }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
  await expect(visibleGetByText(page, name, { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });
}
