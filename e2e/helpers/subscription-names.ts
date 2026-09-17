/**
 * e2e が作るサブスク名の接頭辞。
 * 掃除スクリプト（`scripts/reset-e2e-subscriptions.ts`）と共有するため、
 * Playwright に依存しない独立したファイルに置く。
 * 新しい接頭辞を使うときはここへ追加する（未登録だと型で弾かれ、掃除からも漏れる）。
 */
export const E2E_SUBSCRIPTION_PREFIXES = ["E2E", "Layout", "Soon"] as const;

export type E2ESubscriptionPrefix = (typeof E2E_SUBSCRIPTION_PREFIXES)[number];
