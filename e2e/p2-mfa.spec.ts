import { expect, test, type Page } from "@playwright/test";
import {
  getE2EMfaCredentials,
  loginWithE2EMfaUser,
  logoutFromApp,
} from "./helpers/auth";
import { generateTotpCode } from "./helpers/totp";

const MFA_ENABLED_DESCRIPTION =
  "二段階認証は有効です。ログイン時に認証アプリの 6 桁コードが必要です。";

test.describe("P2-M MFA", () => {
  test.describe.configure({ mode: "serial" });
  // MFA 専用ユーザーで都度ログインするため、共有セッションを使わない
  test.use({ storageState: { cookies: [], origins: [] } });

  let totpSecret = "";
  let backupCodes: string[] = [];

  /** 設定ダイアログから登録を完了し、シークレットとバックアップコードを返す */
  async function enrollMfa(
    page: Page
  ): Promise<{ secret: string; codes: string[] }> {
    await page.getByRole("button", { name: "MFA を設定する" }).click();
    await expect(page.getByRole("heading", { name: "MFA設定" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('input[name="secret"]')).toBeAttached({
      timeout: 30_000,
    });
    const secret = await page.locator('input[name="secret"]').inputValue();

    await page
      .locator("#mfa-settings-dialog-token")
      .fill(generateTotpCode(secret));
    await page.getByRole("button", { name: "設定を確定" }).click();

    const codeList = page.getByRole("list", { name: "バックアップコード一覧" });
    await expect(codeList).toBeVisible({ timeout: 30_000 });
    const codes = await codeList.getByRole("listitem").allTextContents();

    const doneButton = page.getByRole("button", { name: "完了" });
    await expect(doneButton).toBeDisabled();
    await page.locator("#mfa-backup-codes-acknowledged").click();
    await expect(doneButton).toBeEnabled();
    await doneButton.click();

    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
    await expect(
      page.getByRole("button", { name: "MFA を解除する" })
    ).toBeVisible({ timeout: 15_000 });

    return { secret, codes };
  }

  async function disableMfa(page: Page): Promise<void> {
    await page.getByRole("button", { name: "MFA を解除する" }).click();
    await expect(
      page.getByRole("heading", { name: "二段階認証（MFA）の解除" })
    ).toBeVisible();
    await page
      .locator("#mfa-disable-password")
      .fill(getE2EMfaCredentials().password);
    await page.getByRole("button", { name: "解除する" }).click();
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 30_000 });
    await expect(
      page.getByRole("button", { name: "MFA を設定する" })
    ).toBeVisible();
  }

  async function ensureMfaDisabled(page: Page): Promise<void> {
    await page.goto("/settings");
    const disableButton = page.getByRole("button", { name: "MFA を解除する" });
    if (await disableButton.isVisible().catch(() => false)) {
      await disableMfa(page);
    }
  }

  test("M1–M5: enable MFA, login with TOTP and backup code, then disable", async ({
    page,
  }) => {
    await loginWithE2EMfaUser(page);
    await ensureMfaDisabled(page);

    // M1: MFA section shows disabled state
    await expect(
      page.getByText(
        "メールとパスワードに加え、認証アプリ（Google Authenticator 等）でログインを保護できます。設定は任意です。"
      )
    ).toBeVisible();

    // M2 / M2b: enroll MFA and receive the backup codes once
    const enrollment = await enrollMfa(page);
    totpSecret = enrollment.secret;
    backupCodes = enrollment.codes;
    expect(totpSecret.length).toBeGreaterThan(10);
    expect(backupCodes).toHaveLength(10);

    // M3: logout and login requiring TOTP
    await logoutFromApp(page);
    await loginWithE2EMfaUser(page, { totpSecret });
    await expect(page).toHaveURL(/\/subscriptions/);

    // M5: logout and login using a backup code instead of the authenticator
    await logoutFromApp(page);
    await loginWithE2EMfaUser(page, { backupCode: backupCodes[0] });
    await expect(page).toHaveURL(/\/subscriptions/);

    // M4: disable MFA and leave user MFA-off for future runs
    await page.goto("/settings");
    await disableMfa(page);
  });

  test("M6: 解除後に開き直しても有効表示を持ち越さない", async ({ page }) => {
    await loginWithE2EMfaUser(page);
    await ensureMfaDisabled(page);

    // 再読み込みを挟まず、同一ページのまま 有効化 → 解除 → 開き直し を行う
    await enrollMfa(page);
    await disableMfa(page);

    await page.getByRole("button", { name: "MFA を設定する" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "MFA設定" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(dialog.getByText(MFA_ENABLED_DESCRIPTION)).toBeHidden();
  });
});
