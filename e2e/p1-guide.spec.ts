import { expect, test } from "@playwright/test";
import { loginWithE2EUser } from "./helpers/auth";

const GUIDE_STEP_TITLES = [
  "アカウント登録",
  "サブスク登録・変更",
  "お知らせメール設定",
  "サブスク一覧で確認",
] as const;

const GUIDE_IMAGE_ALTS = [
  "アカウント登録の説明図",
  "サブスク登録・変更の説明図",
  "お知らせメール設定の説明図",
  "サブスク一覧確認の説明図",
] as const;

test.describe("P1-G guide", () => {
  test.beforeEach(async ({ page }) => {
    await loginWithE2EUser(page);
    await page.goto("/guide");
  });

  test("G1: guide page shows main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "サブスクMEMOの使い方" })
    ).toBeVisible();
  });

  test("G2: all four step titles are visible", async ({ page }) => {
    for (const title of GUIDE_STEP_TITLES) {
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    }
  });

  test("G3: all four step images are visible", async ({ page }) => {
    for (const alt of GUIDE_IMAGE_ALTS) {
      await expect(page.getByRole("img", { name: alt })).toBeVisible();
    }
  });
});
