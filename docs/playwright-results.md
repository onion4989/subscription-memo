# Playwright E2E 実施結果（P0〜P2）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-19 |
| コマンド | `npm run test:e2e -- --workers=1` |
| 環境 | Node.js v24.15.0 / Playwright Chromium / ローカル DB（`.env.local`） |
| 結果 | **P0: 12 / P1: 13 / P2-M: 1 / P2-E: 1**（P2 含む全体は `npm run test:e2e` で再確認可） |
| 認証 | `E2E_USER_*`（P0/P1）/ `E2E_MFA_USER_*`（P2-M）/ `E2E_SIGNUP_*` + IMAP（P2-E） |

## スコープ

- **含む**: P0〜P1、P2 MFA 完了フロー、P2 サインアップ確認（SMTP 実送信 + IMAP でリンク取得）
- **含まない**: OAuth 自動化（手動確認）

## 前提・注意

- `AUTH_URL` と Playwright baseURL を揃える
- MFA 専用ユーザーは P0/P1 ユーザーと分離し、テスト後は MFA オフへ戻す
- サインアップは `E2E_SIGNUP_EMAIL` をベースに `+e2e-<timestamp>` でユニーク化
- IMAP: `E2E_IMAP_HOST` / `PORT=993` / `USER` / `PASSWORD`

## テストファイル一覧

| 優先度 | ファイル | ケース ID |
|--------|----------|-----------|
| P0 | `e2e/p0-guards.spec.ts` | G1–G3 |
| P0 | `e2e/p0-auth.spec.ts` | A1–A6 |
| P0 | `e2e/p0-subscriptions.spec.ts` | S1–S6 |
| P1 | `e2e/p1-account.spec.ts` | A1–A5 |
| P1 | `e2e/p1-settings.spec.ts` | S1–S5 |
| P1 | `e2e/p1-guide.spec.ts` | G1–G3 |
| P2 | `e2e/p2-mfa.spec.ts` | M1–M4 |
| P2 | `e2e/p2-signup-email.spec.ts` | E1–E3 |

## P2 ケース別結果

### P2-M MFA

| ID | 内容 | 結果 |
|----|------|------|
| M1–M4 | 有効化 → TOTP ログイン → 無効化 | Pass |
### P2-E サインアップ確認（B1）

| ID | 内容 | 結果 |
|----|------|------|
| E1–E3 | `+tag` で登録 → SMTP → IMAP でリンク取得 → 確認 → ログイン | Pass |

## 追記: モバイルカード / 転置テーブル対応後の P0-S 再実行（2026-07-27）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-27 |
| コマンド | `npm run test:e2e -- e2e/p0-subscriptions.spec.ts` |
| 環境 | Node.js v24.15.0 / Playwright Chromium 149 / ローカル DB（`.env.local`） |
| 結果 | **4 passed / 0 failed**（約 7.6s） |

### 変更点（ヘルパー）

- `deleteSubscriptionByName`: 旧 CSS グリッド XPath → 転置テーブルの列ヘッダー同列「削除」
- `visibleGetByText`: モバイルカードとデスクトップテーブルが DOM 共存するため、visible 要素のみ対象

### ケース別結果

| ID | 内容 | 結果 |
|----|------|------|
| S1 | 一覧ロード（空 or 契約数） | Pass |
| S2–S5 | 作成 → 一覧表示 → 削除 | Pass |
| S3 | 必須未入力のバリデーション | Pass |
| S6 | サイドバー遷移 | Pass |

## 実行コマンド

```bash
nvm use
npm run test:e2e -- --workers=1
# P2 のみ:
npm run test:e2e -- --workers=1 e2e/p2-mfa.spec.ts e2e/p2-signup-email.spec.ts
```
