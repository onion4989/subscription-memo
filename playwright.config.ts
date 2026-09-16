import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv({ path: path.resolve(__dirname, ".env.local") });

/**
 * Auth.js cookies / redirects follow AUTH_URL.
 * Keep Playwright baseURL in sync (prefer PLAYWRIGHT_BASE_URL, else AUTH_URL).
 */
const e2eBaseURL =
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  process.env.AUTH_URL?.trim() ||
  "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  // ローカルは成功時ほぼ無出力の dot。失敗時は末尾に詳細が出る
  reporter: process.env.CI ? "list" : "dot",
  use: {
    baseURL: e2eBaseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.resolve(__dirname, "e2e/.auth/user.json"),
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: e2eBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      AUTH_URL: e2eBaseURL,
    },
  },
});
