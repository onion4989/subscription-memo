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
- P2-M が途中で失敗すると MFA が有効なまま残り、シークレットもバックアップコードも手元にないため次回のログインができなくなる。その場合は `npm run e2e:reset-mfa` で `E2E_MFA_USER_EMAIL` の MFA・バックアップコード・失敗履歴をリセットする（ローカル DB 専用。`DATABASE_URL` がローカル以外を指す場合は中止する）
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
| P2 | `e2e/p2-mfa.spec.ts` | M1–M6 |
| P2 | `e2e/p2-demo.spec.ts` | D1–D4 |
| P2 | `e2e/p2-signup-email.spec.ts` | E1–E3 |

## P2 ケース別結果

### P2-M MFA

| ID | 内容 | 結果 |
|----|------|------|
| M1–M5 | 有効化 → バックアップコード提示 → TOTP ログイン → バックアップコードログイン → 無効化 | Pass |
| M6 | 解除後に同一ページで設定ダイアログを開き直しても有効表示を持ち越さない | Pass |

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
- 登録・削除画面のテーブル枠を一覧と同じ `SUB_TABLE_SECTION_FRAME_CLASS` に統一
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

## 追記: MFA バックアップコード対応後の全体再実行（2026-08-01）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-08-01 |
| コマンド | `npx playwright test --workers=1 --reporter=list` |
| 環境 | Node.js v24.15.0 / Chromium / `http://localhost:3000` / ローカル Postgres（Docker） |
| 結果 | **32 passed / 1 skipped / 0 failed**（所要 1.2 分） |

### 変更概要（対象機能）

- MFA 有効化時にバックアップコード 10 件を発行し、設定フローの最終ステップで一度だけ提示
- `/mfa/verify` で TOTP とバックアップコードを切り替えて認証できるように変更
- MFA 解除時にバックアップコードを同一トランザクションで全削除

### P2-M MFA（`e2e/p2-mfa.spec.ts`）

1 テスト内で M1 → M2 → M2b → M3 → M5 → M4 の順に直列実行する。

| ID | 内容 | 結果 |
|----|------|------|
| M1 | 未設定時は MFA セクションが無効状態の説明を表示する | Pass |
| M2 | QR / シークレットを取得し、TOTP コードで設定を確定する | Pass |
| M2b | バックアップコードが 10 件表示され、「控えました」にチェックするまで完了ボタンが押せない | Pass |
| M3 | ログアウト後、認証アプリの 6 桁コードでログインできる | Pass |
| M5 | ログアウト後、控えたバックアップコード 1 件でログインできる | Pass |
| M4 | パスワード確認のうえ MFA を解除し、未設定状態に戻る | Pass |

M2b で取得した平文コードをテスト内で保持し、M5 でそのまま `/mfa/verify` に入力している。表示形式（`XXXX-XXXX-XX`）のまま入力してもサーバー側の正規化で通ることを実ブラウザで確認した。

### 回帰確認（既存スペック）

| 対象 | 結果 |
|------|------|
| P0-G / P0-A / P0-S（12 件） | Pass |
| P1-A アカウント（5 件） | Pass |
| P1-S 設定（5 件） | Pass |
| P1-G 使い方（5 件） | Pass |
| P1 レイアウト L1–L3 | Pass |
| P2-E サインアップ確認（B1 IMAP） | Pass |

P1-S の S5（MFA 設定ダイアログが開く）は、`MfaSetupFlow` から `autoNotifyOnComplete` と完了通知用 `useEffect` を削除した後も従来どおり動作することを確認。L4 のスキップ理由は前節と同じ。

## 追記: MFA 解除後のダイアログ表示バグ修正（2026-08-01）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-08-01 |
| コマンド | `npx playwright test --workers=1 --reporter=line` |
| 環境 | Node.js v24.15.0 / Chromium / `http://localhost:3000` / ローカル Postgres（Docker） |
| 結果 | **33 passed / 1 skipped / 0 failed**（所要 1.3 分） |

### 修正内容

`MfaSettingsDialog` は設定直後に `router.refresh()` が届くまでの間だけ有効表示を保つため、クライアント状態 `setupCompleted` を持っている。このフラグが MFA 解除後も残るため、同一ページのまま設定ダイアログを開き直すと「二段階認証は有効です」が表示されていた。`totpEnabled` の変化を描画中に検知して `setupCompleted` を落とす state 調整で解消した。

### P2-M MFA（`e2e/p2-mfa.spec.ts`）

M1–M5 は 1 テストで直列実行し、M6 は独立したテストに分離した。M6 はページを再読み込みせずに「有効化 → 解除 → ダイアログ開き直し」を行う必要があるため、既存フロー（ログアウトを挟むため毎回マウントし直される）では再現しない。

| ID | 内容 | 結果 |
|----|------|------|
| M1–M5 | 前節と同じ（有効化 → バックアップコード提示 → TOTP ログイン → バックアップコードログイン → 解除） | Pass |
| M6 | 解除後に同一ページで設定ダイアログを開くと、有効表示ではなく登録フローが出る | Pass |

M6 は修正を一時的に無効化した状態で失敗する（`MFA設定` 見出しが見つからない）ことを確認済み。登録・解除の手順は `enrollMfa` / `disableMfa` ヘルパーに切り出して M1–M5 と共有している。

### 回帰確認

| 対象 | 結果 |
|------|------|
| P0 / P1 / P2 の全スペック | Pass（L4 のみ従来どおりスキップ） |

## 追記: デモアカウント（2026-08-02）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-08-02 |
| コマンド | `npx playwright test e2e/p2-demo.spec.ts --workers=1` |
| 環境 | Node.js / Chromium / `http://localhost:3000` / ローカル Postgres |
| 前処理 | `npm run demo:reset` |
| 結果 | **4 passed / 0 failed**（約 7.4s） |

### P2-D デモアカウント（`e2e/p2-demo.spec.ts`）

| ID | 内容 | 結果 |
|----|------|------|
| D1 | `demo@example.com` / `demo1234` でログインし、シードされたサブスク名が見える | Pass |
| D2 | 設定画面で MFA セクション・設定ボタンが出ない | Pass |
| D3 | アカウント画面で削除・パスワード変更 UI が出ず、メールが disabled | Pass |
| D4 | `/mfa/setup` へ直接アクセスすると `/settings` へ戻る | Pass |

Cron エンドポイント `POST /api/cron/demo-reset` は、`.env.local` に `DEMO_RESET_JOB_SECRET` が無い状態でライブ呼び出しすると `500 DEMO_RESET_JOB_SECRET is not configured` を返すことを確認（想定どおり）。認証成功パスは Vitest の route テストでカバー。

## 追記: 公開認証フォームのレートリミット（2026-09-04）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-09-04 |
| コマンド | 下記「段階別」参照（いずれも `--workers=1`） |
| 環境 | Node.js v25.9.0 / Playwright 1.61.1 / Chromium / ローカル DB（`.env.local`） |
| 注意 | RL は webServer プロセス共有のインメモリ。`p0-auth-rate-limit` は専用メール・serial・**単独実行**推奨 |

### 段階別結果

| 段階 | コマンド | 結果 |
|------|---------|------|
| P2 回帰 | `npm run test:e2e -- --workers=1 e2e/p0-auth.spec.ts e2e/p0-guards.spec.ts` | **8 passed**（約 12.3s） |
| P3 RL | `npm run test:e2e -- --workers=1 e2e/p0-auth-rate-limit.spec.ts` | **2 passed**（約 8.8s） |
| P4 回帰 | `npm run test:e2e -- --workers=1 e2e/p0-subscriptions.spec.ts` | **4 passed**（約 14.1s） |

### P3 新規（`e2e/p0-auth-rate-limit.spec.ts`）

`E2E_USER_*` は使わない（`rl-login@example.invalid` / `rl-forgot@example.invalid`）。

| ID | 内容 | 結果 |
|----|------|------|
| RL-A | 誤パスワードをメール上限（10）まで送信後、11 回目で上部に制限メッセージ | Pass |
| RL-B | forgot-password をメール上限+1（6）回送信し、毎回「メールを確認してください」 | Pass |

SMTP 未送信の厳密検証は Vitest（F1）側。E2E の RL-B は成功画面の維持を確認する。

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
# MFA（バックアップコード含む）:
npx playwright test e2e/p2-mfa.spec.ts --workers=1
# デモアカウント:
npx playwright test e2e/p2-demo.spec.ts --workers=1
# 認証フォーム RL（単独実行）:
npm run test:e2e -- --workers=1 e2e/p0-auth-rate-limit.spec.ts
```
