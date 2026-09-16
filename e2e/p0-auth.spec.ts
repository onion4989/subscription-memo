import { expect, test } from "@playwright/test";
import { getE2ECredentials, loginWithE2EUser, logoutFromApp } from "./helpers/auth";

test.describe("P0-A credentials auth", () => {
  // ログイン動線そのものを検証するため、共有セッションを使わない
  test.use({ storageState: { cookies: [], origins: [] } });

  test("A1: login page shows email, password, and submit", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ログイン", exact: true })
    ).toBeVisible();
  });

  test("A2: wrong password shows an error and stays off protected pages", async ({
    page,
  }) => {
    const { email } = getE2ECredentials();
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("definitely-wrong-password-xxx");
    await page.getByRole("button", { name: "ログイン", exact: true }).click();

    await expect(
      page.getByText("メールアドレスまたはパスワードが正しくありません")
    ).toBeVisible({ timeout: 15_000 });
    expect(page.url()).toMatch(/\/login/);
  });

  test("A3–A4: valid login reaches subscriptions and logout returns to login", async ({
    page,
  }) => {
    await loginWithE2EUser(page);
    await expect(page).toHaveURL(/\/subscriptions/);

    await logoutFromApp(page);
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/subscriptions");
    await page.waitForURL(/\/login/);
  });

  test("A5: /login?verified=1 shows verification success message", async ({
    page,
  }) => {
    await page.goto("/login?verified=1");
    await expect(
      page.getByText("メールアドレスの確認が完了しました。ログインしてください。")
    ).toBeVisible();
  });

  test("A6: /login?error=CredentialsSignin shows credentials error", async ({
    page,
  }) => {
    await page.goto("/login?error=CredentialsSignin");
    await expect(
      page.getByText("メールアドレスまたはパスワードが正しくありません。")
    ).toBeVisible();
  });
});
