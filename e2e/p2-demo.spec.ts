import { expect, test } from "@playwright/test";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "../src/lib/demo/constants";
import { loginWithCredentials } from "./helpers/auth";

test.describe("P2-D demo account", () => {
  test.describe.configure({ mode: "serial" });

  test("D1: demo credentials can log in and see seeded subscriptions", async ({
    page,
  }) => {
    await loginWithCredentials(page, DEMO_USER_EMAIL, DEMO_USER_PASSWORD);

    await expect(page).toHaveURL(/\/subscriptions/);
    await expect(
      page.getByRole("heading", { name: "サブスクリプション一覧" })
    ).toBeVisible();

    // デスクトップ表では名前が span、モバイルでは heading。どちらでも exact で一意に取れる
    await expect(page.getByText("Netflix", { exact: true })).toBeVisible();
    await expect(page.getByText("Spotify", { exact: true })).toBeVisible();
    await expect(page.getByText("ChatGPT", { exact: true })).toBeVisible();
  });

  test("D2: demo account hides MFA controls on settings", async ({ page }) => {
    await loginWithCredentials(page, DEMO_USER_EMAIL, DEMO_USER_PASSWORD);
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "一般設定" })).toBeVisible();
    await expect(
      page.getByText("デモアカウントのため、二段階認証の設定はご利用いただけません")
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "二段階認証（MFA）" })
    ).toBeHidden();
    await expect(
      page.getByRole("button", { name: "MFA を設定する" })
    ).toBeHidden();
  });

  test("D3: demo account hides delete and password change on account", async ({
    page,
  }) => {
    await loginWithCredentials(page, DEMO_USER_EMAIL, DEMO_USER_PASSWORD);
    await page.goto("/account");

    await expect(page.getByRole("heading", { name: "プロフィール" })).toBeVisible();
    await expect(
      page.getByText("デモアカウントのため、メールアドレス・パスワードの変更とアカウント削除はできません")
    ).toBeVisible();

    await expect(page.locator("#email")).toBeDisabled();
    await expect(page.locator("#currentPassword")).toHaveCount(0);
    await expect(page.locator("#newPassword")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "アカウントを削除する" })
    ).toBeHidden();
  });

  test("D4: /mfa/setup redirects demo user back to settings", async ({
    page,
  }) => {
    await loginWithCredentials(page, DEMO_USER_EMAIL, DEMO_USER_PASSWORD);
    await page.goto("/mfa/setup");
    await expect(page).toHaveURL(/\/settings/);
  });
});
