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
| P1 | `e2e/p1-guide.spec.ts` | G1–G5 |
| P1 | `e2e/p1-subscription-layout.spec.ts` | L1–L4 |
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

## 追記: シェル max 1000px / セクション枠デザイン統一（2026-07-29）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-29 |
| コマンド | `npx playwright test e2e/p1-subscription-layout.spec.ts --workers=1` |
| 環境 | Node.js v24.15.0 / Playwright Chromium / ローカル DB（`.env.local`） |
| 結果 | **3 passed / 1 skipped / 0 failed**（約 23.6s） |

### 変更概要（対象機能）

- 一覧のお知らせ・サマリー・テーブル枠デザイン統一（黒背景・白 2px）
- 登録・削除画面のテーブル枠を一覧と同じ `SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS` に統一
- 右側シェル領域 `max-w-[1000px]`
- テーブル枠上余白 `pt-12`（「更新間近」吹き出しの上方向はみ出し対策）

### ケース別結果

| ID | 内容 | 結果 |
|----|------|------|
| L1 | 一覧・登録・削除で右側シェル領域 ≤ 1000px | Pass |
| L2 | 一覧・登録・削除のテーブル枠が黒背景・白 2px | Pass |
| L3 | 「更新間近」吹き出しが枠の上辺より下（縦方向のみ検証） | Pass |
| L4 | 削除画面の空状態ではテーブル枠なし | **Skipped**（既存データあり） |

### 補足（L3）

- 初回実行では吹き出し右端が枠外となり横方向アサーションで失敗。
- Portal + 列位置による横はみ出しは許容し、本番修正目的の縦方向のみに緩和して再実行で Pass。

## 追記: 使い方ページ刷新 / `useEffect` 整理後の全体再実行（2026-07-31）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-31 |
| コマンド | `npm run test:e2e -- --workers=1`（全スペック） |
| 環境 | Node.js v24.15.0 / Playwright Chromium / ローカル DB（`.env.local`） |
| 結果 | **32 passed / 1 skipped / 0 failed**（約 1.1 分） |

### 変更概要（対象機能）

- 使い方ページを 5 セクション構成へ刷新（黒背景・白 2px 枠 + 説明画像）
- `AppShell` のサイドバー閉じ処理を effect からレンダー中の state 調整へ変更
- `SubscriptionNameHeaderCell` の枠内可視判定を ref コールバックへ移行

### P1-G 使い方ページ

| ID | 内容 | 結果 |
|----|------|------|
| G1 | 使い方ページの主見出しが表示される | Pass |
| G2 | 5 セクションのタイトルがすべて表示される | Pass |
| G3 | 各セクション本文が黒背景・白 2px 枠の中にある | Pass |
| G4 | データの登録方法に番号付き手順が並ぶ | Pass |
| G5 | 各説明画像が白枠の内側（余白 16px）に収まる | Pass |

### 回帰確認（既存スペック）

| 対象 | 結果 |
|------|------|
| P0-G / P0-A / P0-S（12 件） | Pass |
| P1-A アカウント（5 件） | Pass |
| P1-S 設定（5 件） | Pass |
| P1 レイアウト L1–L3 | Pass |
| P2-M MFA / P2-E サインアップ確認 | Pass |

`AppShell` 変更のサイドバー遷移は P0-S の S6、ref コールバック移行後の「更新間近」吹き出しは L3 でそれぞれ実ブラウザ確認済み。

### スキップ 1 件について

L4（削除画面の空状態でテーブル枠を出さない）は、E2E ユーザーにサブスクリプションが登録済みのため空状態に到達せずスキップ。同等の検証は Vitest の `SubscriptionDeleteForm.layout.test.tsx`（`initialSaved={[]}`）でカバー済み。実行する場合は E2E ユーザーの `Subscription` 行のみを空にする（`User` 行は他テストの前提となるため削除しない）。

## 実行コマンド

```bash
nvm use
npm run test:e2e -- --workers=1
# P2 のみ:
npm run test:e2e -- --workers=1 e2e/p2-mfa.spec.ts e2e/p2-signup-email.spec.ts
# レイアウト:
npx playwright test e2e/p1-subscription-layout.spec.ts --workers=1
# 使い方ページ:
npx playwright test e2e/p1-guide.spec.ts --workers=1
```
