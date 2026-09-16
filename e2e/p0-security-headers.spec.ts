import { expect, test } from "@playwright/test";

// HSTS は本番のみ付与するため、ここでは検証しない
const EXPECTED_HEADERS: Record<string, string> = {
  "x-frame-options": "DENY",
  "content-security-policy": "frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

test.describe("P0-SH security headers", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("SH1: public pages return the security headers", async ({ page }) => {
    const response = await page.goto("/login");
    const headers = response?.headers() ?? {};

    for (const [key, value] of Object.entries(EXPECTED_HEADERS)) {
      expect(headers[key], `missing or wrong header: ${key}`).toBe(value);
    }
  });
});
