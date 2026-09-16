import { expect, test } from "@playwright/test";

const GUIDE_SECTION_TITLES = [
  "データの登録方法",
  "パスワードの変更",
  "パスワードを忘れた場合",
  "お知らせメール設定",
  "セキュリティについて",
] as const;

const GUIDE_STEP_TITLES = ["登録画面へ", "追加ボタンを押下", "データ確認"] as const;

const GUIDE_SECTION_IMAGE_ALTS = [
  "パスワード変更フォームの説明図",
  "ログイン画面のパスワード再設定リンクの説明図",
  "お知らせメールの通知日設定の説明図",
  "二段階認証（MFA）設定の説明図",
] as const;

test.describe("P1-G guide", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide");
  });

  test("G1: guide page shows main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "サブスクMEMOの使い方" })
    ).toBeVisible();
  });

  test("G2: all section titles are visible", async ({ page }) => {
    for (const title of GUIDE_SECTION_TITLES) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
  });

  test("G3: each section body sits in a black frame with a 2px white border", async ({
    page,
  }) => {
    for (const title of GUIDE_SECTION_TITLES) {
      const frame = page
        .getByRole("heading", { name: title })
        .locator("xpath=following-sibling::div[1]");

      await expect(frame).toBeVisible();
      await expect(frame).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await expect(frame).toHaveCSS("border-top-width", "2px");
      await expect(frame).toHaveCSS("border-top-color", "rgb(255, 255, 255)");
    }
  });

  test("G4: data registration section lists the numbered steps", async ({
    page,
  }) => {
    for (const title of GUIDE_STEP_TITLES) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
  });

  test("G5: each section image renders inside its white frame", async ({
    page,
  }) => {
    for (const alt of GUIDE_SECTION_IMAGE_ALTS) {
      const image = page.getByRole("img", { name: alt });

      await expect(image).toBeVisible();
      await expect(image.locator("xpath=..")).toHaveCSS(
        "padding-top",
        "16px"
      );
    }
  });
});
