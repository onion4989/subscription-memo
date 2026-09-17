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

  test("G4: crawler and monitoring endpoints are reachable without a session", async ({
    request,
  }) => {
    for (const path of ["/robots.txt", "/sitemap.xml", "/api/health"]) {
      const response = await request.get(path);
      expect(response.status(), `unexpected status for ${path}`).toBe(200);
    }
  });

  test("G5: web app manifest is served without a session", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    // リダイレクトは自動追従されるため、中身が manifest であることまで確かめる
    expect(response.url()).not.toMatch(/\/login/);

    const manifest = await response.json();
    expect(manifest.name).toBe("サブスクMEMO");
    expect(manifest.icons).toHaveLength(2);
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
