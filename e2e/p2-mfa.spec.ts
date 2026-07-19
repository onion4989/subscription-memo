import { expect, test } from "@playwright/test";
import {
  getE2EMfaCredentials,
  loginWithE2EMfaUser,
  logoutFromApp,
} from "./helpers/auth";
import { generateTotpCode } from "./helpers/totp";

test.describe("P2-M MFA", () => {
  test.describe.configure({ mode: "serial" });

  let totpSecret = "";

  async function ensureMfaDisabled(page: import("@playwright/test").Page) {
    await page.goto("/settings");
    const disableButton = page.getByRole("button", { name: "MFA を解除する" });
    if (await disableButton.isVisible().catch(() => false)) {
      const { password } = getE2EMfaCredentials();
      await disableButton.click();
      await expect(
        page.getByRole("heading", { name: "二段階認証（MFA）の解除" })
      ).toBeVisible();
      await page.locator("#mfa-disable-password").fill(password);
      await page.getByRole("button", { name: "解除する" }).click();
      await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
      await expect(
        page.getByRole("button", { name: "MFA を設定する" })
      ).toBeVisible();
    }
  }

  test("M1–M4: enable MFA, login with TOTP, then disable", async ({ page }) => {
    await loginWithE2EMfaUser(page);
    await ensureMfaDisabled(page);

    // M1: MFA section shows disabled state
    await expect(
      page.getByText(
        "メールとパスワードに加え、認証アプリ（Google Authenticator 等）でログインを保護できます。設定は任意です。"
      )
    ).toBeVisible();

    // M2: enroll MFA
    await page.getByRole("button", { name: "MFA を設定する" }).click();
    await expect(page.getByRole("heading", { name: "MFA設定" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('input[name="secret"]')).toBeAttached({
      timeout: 30_000,
    });
    totpSecret = await page.locator('input[name="secret"]').inputValue();
    expect(totpSecret.length).toBeGreaterThan(10);

    await page
      .locator("#mfa-settings-dialog-token")
      .fill(generateTotpCode(totpSecret));
    await page.getByRole("button", { name: "設定を確定" }).click();
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
    await expect(
      page.getByRole("button", { name: "MFA を解除する" })
    ).toBeVisible({ timeout: 15_000 });

    // M3: logout and login requiring TOTP
    await logoutFromApp(page);
    await loginWithE2EMfaUser(page, { totpSecret });
    await expect(page).toHaveURL(/\/subscriptions/);

    // M4: disable MFA and leave user MFA-off for future runs
    await page.goto("/settings");
    await page.getByRole("button", { name: "MFA を解除する" }).click();
    await page
      .locator("#mfa-disable-password")
      .fill(getE2EMfaCredentials().password);
    await page.getByRole("button", { name: "解除する" }).click();
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
    await expect(
      page.getByRole("button", { name: "MFA を設定する" })
    ).toBeVisible();
  });
});
