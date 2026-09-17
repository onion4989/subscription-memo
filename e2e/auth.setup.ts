import path from "node:path";
import { test as setup } from "@playwright/test";
import { loginWithE2EUser } from "./helpers/auth";

/**
 * 共有セッションの保存先。
 * spec ごとにログインするとレートリミット（同一 IP 15 分 30 回）に達するため、
 * 1 回だけログインして全 spec で使い回す。
 * ログイン動線そのものは p0-auth / p0-auth-rate-limit が未ログイン状態で検証する。
 */
export const E2E_STORAGE_STATE = path.join(__dirname, ".auth", "user.json");

setup("authenticate as the shared E2E user", async ({ page }) => {
  await loginWithE2EUser(page);
  await page.context().storageState({ path: E2E_STORAGE_STATE });
});
