import { expect, type Page } from "@playwright/test";
import { LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/auth/rate-limit-constants";
import { generateTotpCode } from "./totp";

export function getE2ECredentials(): { email: string; password: string } {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in .env.local"
    );
  }

  return { email, password };
}

export function getE2EMfaCredentials(): { email: string; password: string } {
  const email = process.env.E2E_MFA_USER_EMAIL?.trim();
  const password = process.env.E2E_MFA_USER_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "E2E_MFA_USER_EMAIL and E2E_MFA_USER_PASSWORD must be set in .env.local"
    );
  }

  return { email, password };
}

export function getE2ESignupCredentials(): { email: string; password: string } {
  const email = process.env.E2E_SIGNUP_EMAIL?.trim();
  const password = process.env.E2E_SIGNUP_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "E2E_SIGNUP_EMAIL and E2E_SIGNUP_PASSWORD must be set in .env.local"
    );
  }

  return { email, password };
}

async function expectSubscriptionsList(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: "サブスクリプション一覧" })
  ).toBeVisible({ timeout: 15_000 });
}

type MfaChallengeOptions = {
  totpSecret?: string;
  backupCode?: string;
};

async function passMfaChallenge(
  page: Page,
  options: MfaChallengeOptions
): Promise<void> {
  if (options.backupCode) {
    await page.getByRole("button", { name: "バックアップコードを使う" }).click();
    await page.locator("#mfa-verify-backup-code").fill(options.backupCode);
  } else if (options.totpSecret) {
    await page
      .locator("#mfa-verify-token")
      .fill(generateTotpCode(options.totpSecret));
  } else {
    throw new Error(
      "MFA verify page reached but neither totpSecret nor backupCode was provided"
    );
  }

  await page.getByRole("button", { name: "認証", exact: true }).click();
  await page.waitForURL(
    (url) =>
      url.pathname === "/subscriptions" ||
      url.pathname.startsWith("/subscriptions/"),
    { timeout: 60_000 }
  );
}

export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
  options?: MfaChallengeOptions
): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "ログイン", exact: true }).click();

  const credentialsError = page.getByText(
    "メールアドレスまたはパスワードが正しくありません"
  );
  const unverifiedError = page.getByText("メール確認が完了していません");
  // 上限に当たった場合、待つだけでは 60 秒のタイムアウトになり原因が分からない
  const rateLimitError = page.getByText(LOGIN_RATE_LIMIT_MESSAGE);

  await Promise.race([
    page.waitForURL(
      (url) =>
        url.pathname === "/subscriptions" ||
        url.pathname.startsWith("/subscriptions/") ||
        url.pathname === "/mfa/verify",
      { timeout: 60_000 }
    ),
    credentialsError.waitFor({ state: "visible", timeout: 60_000 }).then(() => {
      throw new Error(
        `Credentials login failed for ${email} (wrong password or missing local user)`
      );
    }),
    unverifiedError.waitFor({ state: "visible", timeout: 60_000 }).then(() => {
      throw new Error(`Credentials login failed for ${email} (email not verified)`);
    }),
    rateLimitError.waitFor({ state: "visible", timeout: 60_000 }).then(() => {
      throw new Error(
        `Login rate limit reached for ${email}. ` +
          "dev サーバーを再起動すると窓（15 分）がリセットされます"
      );
    }),
  ]);

  if (page.url().includes("/mfa/verify")) {
    await passMfaChallenge(page, options ?? {});
  }

  await expectSubscriptionsList(page);
}

export async function loginWithE2EUser(page: Page): Promise<void> {
  const { email, password } = getE2ECredentials();
  await loginWithCredentials(page, email, password);
}

export async function loginWithE2EMfaUser(
  page: Page,
  options?: MfaChallengeOptions
): Promise<void> {
  const { email, password } = getE2EMfaCredentials();
  await loginWithCredentials(page, email, password, options);
}

export async function logoutFromApp(page: Page): Promise<void> {
  await page.getByRole("button", { name: "ログアウト" }).click();
  await page.waitForURL(/\/login/, { timeout: 30_000 });
}
