import { expect, test, type Page } from "@playwright/test";
import {
  FORGOT_RATE_LIMIT_PER_EMAIL,
  LOGIN_RATE_LIMIT_MESSAGE,
  LOGIN_RATE_LIMIT_PER_EMAIL,
} from "../src/lib/auth/rate-limit-constants";

/**
 * E2E 専用の架空アドレス。本番 E2E ユーザーと窓を共有しない。
 * インメモリ制限は webServer プロセス共有のため、本ファイルは serial で実行する。
 */
const RL_LOGIN_EMAIL = "rl-login@example.invalid";
const RL_FORGOT_EMAIL = "rl-forgot@example.invalid";
const WRONG_PASSWORD = "definitely-wrong-password-for-rl";

async function submitWrongLogin(page: Page, email: string): Promise<void> {
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(WRONG_PASSWORD);
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
}

async function submitForgotPassword(page: Page, email: string): Promise<void> {
  await page.locator("#email").fill(email);
  await page.getByRole("button", { name: "リセットリンクを送信" }).click();
}

test.describe("P0 auth rate limit", () => {
  test.describe.configure({ mode: "serial" });

  test("RL-A: login shows top alert after email cap is exceeded", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto("/login");

    for (let i = 0; i < LOGIN_RATE_LIMIT_PER_EMAIL; i += 1) {
      await submitWrongLogin(page, RL_LOGIN_EMAIL);
      await expect(
        page.getByText("メールアドレスまたはパスワードが正しくありません")
      ).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(LOGIN_RATE_LIMIT_MESSAGE)).toHaveCount(0);
    }

    await submitWrongLogin(page, RL_LOGIN_EMAIL);

    await expect(page.getByText(LOGIN_RATE_LIMIT_MESSAGE)).toBeVisible({
      timeout: 15_000,
    });
    expect(page.url()).toMatch(/\/login/);
  });

  test("RL-B: forgot-password stays on success screen past email cap", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const submitCount = FORGOT_RATE_LIMIT_PER_EMAIL + 1;

    for (let i = 0; i < submitCount; i += 1) {
      await page.goto("/forgot-password");
      await submitForgotPassword(page, RL_FORGOT_EMAIL);
      await expect(
        page.getByText("メールを確認してください")
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});
