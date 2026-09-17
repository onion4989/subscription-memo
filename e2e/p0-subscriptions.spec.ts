import { expect, test } from "@playwright/test";
import {
  deleteSubscriptionByName,
  fillSubscriptionCreateForm,
  openCreateSubscriptionModal,
  submitSubscriptionCreate,
  uniqueSubscriptionName,
  visibleGetByText,
} from "./helpers/subscription";

test.describe("P0-S subscriptions", () => {
  test("S1: subscriptions list page loads (empty or with data)", async ({
    page,
  }) => {
    await page.goto("/subscriptions");
    const empty = page.getByRole("heading", {
      name: "データが登録されていません。",
    });
    const contractCount = visibleGetByText(page, "契約数");
    await expect(empty.or(contractCount).first()).toBeVisible();
  });

  test("S2–S5: create subscription, see it on list, then delete it", async ({
    page,
  }) => {
    const name = uniqueSubscriptionName();
    const planName = "E2E Plan";

    await openCreateSubscriptionModal(page);
    await fillSubscriptionCreateForm(page, {
      name,
      planName,
      paymentPlan: "月払い",
      monthlyAmount: "1000",
      contractDate: "2025-01-15",
    });
    await submitSubscriptionCreate(page);
    await expect(visibleGetByText(page, name).first()).toBeVisible();

    await page.goto("/subscriptions");
    await expect(visibleGetByText(page, name).first()).toBeVisible();
    await expect(visibleGetByText(page, "契約数").first()).toBeVisible();

    await page.goto("/subscriptions/manage");
    await deleteSubscriptionByName(page, name);
  });

  test("S3: create with missing required fields shows validation errors", async ({
    page,
  }) => {
    await openCreateSubscriptionModal(page);
    await page.getByRole("button", { name: "登録する" }).click();

    await expect(page.getByText("サブスクリプション名は必須です。")).toBeVisible();
    await expect(page.getByText("プラン名は必須です。")).toBeVisible();
    await expect(page.getByText("支払いプランを選択してください。")).toBeVisible();
    await expect(page.getByText("契約日は必須です。")).toBeVisible();
  });

  test("S6: sidebar navigates between main app pages", async ({ page }) => {
    await page.goto("/subscriptions");

    await page.getByRole("link", { name: "サブスク登録・変更" }).click();
    await expect(page).toHaveURL(/\/subscriptions\/new/);

    await page.getByRole("link", { name: "サブスク削除" }).click();
    await expect(page).toHaveURL(/\/subscriptions\/manage/);

    await page.getByRole("link", { name: "使い方" }).click();
    await expect(page).toHaveURL(/\/guide/);
    await expect(
      page.getByRole("heading", { name: "サブスクMEMOの使い方" })
    ).toBeVisible();

    await page.getByRole("link", { name: "サブスク一覧" }).click();
    await expect(page).toHaveURL(/\/subscriptions$/);
  });
});
