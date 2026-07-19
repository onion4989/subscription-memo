import { expect, test } from "@playwright/test";

test.describe("P0-G auth guards", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("G1: unauthenticated /subscriptions redirects to login", async ({
    page,
  }) => {
    await page.goto("/subscriptions");
    await page.waitForURL(/\/login/);
    expect(page.url()).toMatch(/\/login/);
  });

  test("G2: unauthenticated protected pages redirect to login", async ({
    page,
  }) => {
    for (const path of ["/account", "/settings", "/subscriptions/new"]) {
      await page.goto(path);
      await page.waitForURL(/\/login/);
      expect(page.url()).toMatch(/\/login/);
    }
  });

  test("G3: public pages are reachable without a session", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();

    await page.goto("/signup");
    await expect(
      page.getByRole("button", { name: "アカウント作成" })
    ).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("img", { name: "サブスク帳イメージ" })).toBeVisible();
  });
});
