import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import {
  getE2ESignupCredentials,
  loginWithCredentials,
} from "./helpers/auth";
import { uniqueSignupEmail, waitForVerificationLink } from "./helpers/imap";

test.describe("P2-E signup email verification (B1 IMAP)", () => {
  // 新規登録から検証するため、共有セッションを使わない
  test.use({ storageState: { cookies: [], origins: [] } });

  test("E1–E3: signup, verify via IMAP link, then login", async ({ page }) => {
    test.setTimeout(180_000);

    const { email: baseEmail, password } = getE2ESignupCredentials();
    const signupEmail = uniqueSignupEmail(baseEmail);

    await page.goto("/signup");
    await page.locator("#email").fill(signupEmail);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "アカウント作成" }).click();

    await expect(page.getByText("登録完了", { exact: true })).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByText("入力内容を受け付けました。メールをご確認ください。")
    ).toBeVisible();

    const verifyUrl = await waitForVerificationLink(signupEmail, 120_000);
    await page.goto(verifyUrl);
    await expect(page.getByText("メール確認完了", { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByText("メールアドレスの確認が完了しました。ログインしてください。")
    ).toBeVisible();

    await loginWithCredentials(page, signupEmail, password);
    await expect(page).toHaveURL(/\/subscriptions/);

    // Local DB cleanup so re-runs do not accumulate forever
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const adapter = new PrismaPg({ connectionString });
      const prisma = new PrismaClient({ adapter });
      try {
        await prisma.user.deleteMany({ where: { email: signupEmail } });
      } finally {
        await prisma.$disconnect();
      }
    }
  });
});
