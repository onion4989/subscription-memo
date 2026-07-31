# Vitest / 更新お知らせジョブ 実施結果（P0〜P2 + 層 A〜C + アカウント削除）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-31（使い方ページ刷新／`useEffect` 整理）／2026-07-29（セクション枠統一）／2026-07-28（Hybrid B 追いつき）／2026-07-27（モバイルカード）／2026-07-25（アカウント削除 AD1–AD7）／更新お知らせ 層 A〜C: 2026-07-21／初回 P0–P2: 2026-07-19 |
| コマンド（層 A・単体） | `npm run test:run` |
| 環境（層 A・単体） | Node.js v24.15.0 / Vitest v4.1.10 |
| 結果（単体） | **15 files passed / 82 tests passed / 0 failed** |
| 除外 | V4（email / subscription レートリミット） |

## スコープ

- **含む**: P0 → P1 → P2（M2 TOTP 含む）、更新お知らせ日次ジョブ（層 A: SMTP モック / 層 B: 本番実送信 / 層 C: Dokploy Scheduled Tasks）、アカウント削除（メール本文 + Server Action モック）
- **含まない**: V4、Server Actions 結合（アカウント削除以外の全面）、Playwright E2E（更新お知らせ以外）

## テストファイル一覧

| 優先度 | ファイル | ケース ID |
|--------|----------|-----------|
| P0 | `src/lib/subscription/renewal-date.test.ts` | R1–R10 |
| P0 | `src/lib/subscription/amount-sync.test.ts` | A1–A3 |
| P0 | `src/lib/subscription/format-and-summary.test.ts` | U1–U3 |
| P0 | `src/schemas/subscription.test.ts` | S1–S7 |
| P1 | `src/schemas/index.test.ts` | AUTH1–AUTH4 |
| P1 | `src/schemas/profile.test.ts` | P1–P6 |
| P1 | `src/schemas/notification-settings.test.ts` | N1–N3 |
| P1 | `src/lib/mfa/mfa-helpers.test.ts` | M1–M3 |
| P1 | `src/lib/oauth-account-not-linked.test.ts` | O1–O2 |
| P1 | `src/lib/renewal-notification/digest-email.test.ts` | D1 |
| P2 | `src/lib/p2-helpers.test.ts` | V1–V3, V5 |
| お知らせ | `src/lib/renewal-notification/daily-job.test.ts` | J1–J9 |
| お知らせ | `src/app/api/cron/renewal-notifications/route.test.ts` | C1–C4 |
| アカウント | `src/lib/account-deletion/constants.test.ts` | AD1 |
| アカウント | `src/lib/actions/delete-account.test.ts` | AD2–AD7 |

## ケース別結果

### P0

| ID | 内容 | 結果 |
|----|------|------|
| R1 | `isValidYmd` 正常 / 不正形式 / 存在しない日 | Pass |
| R2 | `addMonthsToYmd` 月末繰り越し | Pass |
| R3 | `addYearsToYmd` うるう日 | Pass |
| R4–R7 | `computeNextRenewalDateYmd`（未来契約・過去契約・当日・MONTHLY/YEARLY） | Pass |
| R8 | `advanceRenewalDateToNextCycleYmd` | Pass |
| R9 | `subtractDaysFromYmd` / `computeNotifyDateYmd` | Pass |
| R10 | `ymdToUtcDate` / `utcDateToYmd` 往復 | Pass |
| A1–A3 | 金額 sanitize / 月額↔年額同期 | Pass |
| U1–U3 | サマリー合計・円表示・日付表示 | Pass |
| S1–S7 | サブスク登録スキーマ・ヘルパー | Pass |

### P1

| ID | 内容 | 結果 |
|----|------|------|
| AUTH1–AUTH2 | signup / login スキーマ・フィールドエラー | Pass |
| AUTH3 | Reset / NewPassword（最小8文字） | Pass |
| AUTH4 | Register 確認パスワード一致 | Pass |
| P1–P6 | プロフィール更新スキーマ・ヘルパー | Pass |
| N1–N3 | お知らせ設定スキーマ・チャネル解決（SMS UI on/off） | Pass |
| M1 | `isMfaVerificationPending` | Pass |
| M2 | TOTP secret / URI / verify | Pass |
| M3 | `isOAuthProvider` | Pass |
| O1–O2 | OAuth 未リンククエリ・文言 | Pass |
| D1 | 更新お知らせメール本文 | Pass |

### P2

| ID | 内容 | 結果 |
|----|------|------|
| V1 | アバター ID / 画像パス | Pass |
| V2 | `loginUrlWithSearchParams` / public path prefixes | Pass |
| V3 | `shouldBlockSearchIndexing` | Pass |
| V4 | レートリミット | **除外** |
| V5 | `cn` クラス結合 | Pass |

### 更新お知らせジョブ（層 A）— Vitest・SMTP モック

| ID | 内容 | 結果 |
|----|------|------|
| J1 | 通知日当日 → SMTP 呼び出し＋ログ作成 | Pass |
| J2 | 通知日より前 → 送らない | Pass |
| J3 | 既存ログあり → 再送しない | Pass |
| J4 | 通知日より後の登録 → 除外 | Pass |
| J5 | 送信失敗 → ログを書かない | Pass |
| J6 | 同一ユーザー複数サブスク → ダイジェスト1通 | Pass |
| J7 | Phase2 で複数サイクル遅れを1回で直近未来へ追いつき | Pass |
| J8 | すでに未来の更新日 → Phase2 no-op | Pass |
| J9 | 実行順 Phase2 → Phase1 | Pass |
| C1–C4 | cron Route（Secret 未設定 / 401 / 不正 asOfYmd / 成功） | Pass |

### 更新お知らせジョブ（層 B）— 本番スモーク（実 SMTP）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-21 |
| 環境 | 本番 `https://subscmemo.see-u-soon.design` |
| テストデータ | 契約日 `2026-06-26` / 次回更新日 `2026-07-26` / お知らせ 5日前（通知日 `2026-07-21`） |
| 実行 | `POST /api/cron/renewal-notifications?asOfYmd=2026-07-21`（Bearer: `RENEWAL_JOB_SECRET`） |

| ID | 内容 | 結果 |
|----|------|------|
| B1 | 初回実行 → `phase1.sentUsers: 1` / `sentSubscriptions: 1` / `failedUsers: 0` | Pass |
| B2 | 受信箱に件名「【サブスクMEMO】サブスクリプション更新日のお知らせ」到達 | Pass |
| B3 | 同一 `asOfYmd` 再実行 → `targetSubscriptions: 0` / `sentUsers: 0`（再送防止） | Pass |
| B4 | `phase2.advancedSubscriptions: 0`（更新日未到来のため繰り上げなし） | Pass |

### 更新お知らせジョブ（層 C）— Dokploy Scheduled Tasks

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-21 |
| 前提 | Dokploy Environment で `RENEWAL_JOB_SECRET` 再生成後に Redeploy |
| ジョブ | Scheduled Tasks（アプリ内 cron）。Command は `process.env.RENEWAL_JOB_SECRET` を Bearer に使用 |

| ID | 内容 | 結果 |
|----|------|------|
| S1 | Secret 更新 + Redeploy | Pass |
| S2 | Scheduled Tasks で手動 Run → success（緑） | Pass |

### アカウント削除

| ID | 内容 | 結果 |
|----|------|------|
| AD1 | 削除完了メール件名・本文・確認フレーズ | Pass |
| AD2 | 未認証 → 削除しない | Pass |
| AD3 | パスワード誤り → 削除しない | Pass |
| AD4 | パスワード正解 → 削除・メール・signOut・トップへ | Pass |
| AD5 | 確認フレーズ誤り → 削除しない | Pass |
| AD6 | 確認フレーズ正解（trim）→ 削除・メール・トップへ | Pass |
| AD7 | メール送信失敗でも削除後はトップへ | Pass |

## 追記: モバイルカード / テーブル幅 関連（2026-07-27）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-27 |
| コマンド | `npm run test:run -- src/components/features/subscription src/schemas/subscription.test.ts src/lib/subscription` |
| 環境 | Node.js v24.15.0 / Vitest v4.1.10 |
| 結果 | **7 files passed / 43 tests passed / 0 failed** |

### 追加・関連ファイル

| ファイル | 内容 |
|----------|------|
| `SubscriptionMobileCard.test.tsx` | タイトル連結・支払いプラン文言・料金/日付・action 分岐（8件） |
| `subscription-header-color.test.ts` | 転置テーブルヘッダー色 |
| `subscription-table-width.test.ts` | サマリー最小幅定数 |
| その他 | `schemas/subscription` / `format-and-summary` / `amount-sync` / `renewal-date` |

### 補足

- `vitest.setup.ts` に Testing Library `cleanup` を追加（複数 render の DOM 漏れ防止）

## 追記: Hybrid B（Phase2 追いつき + Phase2→Phase1）（2026-07-28）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-28 |
| 変更概要 | Phase2 を `computeNextRenewalDateYmd(contractDate, …)` による複数サイクル追いつきに強化。実行順を Phase2 → Phase1 に変更 |
| 単体コマンド | `npx vitest run src/lib/renewal-notification/daily-job.test.ts src/lib/subscription/renewal-date.test.ts` |
| 単体環境 | Node.js v24.15.0 / Vitest v4.1.10 |
| 単体結果 | **2 files passed / 24 tests passed / 0 failed**（J1–J9 + renewal-date） |

### 層 A（Vitest）— 追加・更新ケース

| ID | 内容 | 結果 |
|----|------|------|
| J1–J6 | 既存（モック順を Phase2→Phase1 に合わせて修正） | Pass |
| J7 | 複数サイクル遅れ（例: 08/02 → asOf 10/12 で 11/02） | Pass |
| J8 | 未来日は Phase2 no-op | Pass |
| J9 | findMany が Phase2（lt）→ Phase1（notify）の順 | Pass |

### 層 B'（localhost 手動・実 SMTP）

| 項目 | 内容 |
|------|------|
| 環境 | `http://localhost:3000`（`npm run dev`） |
| 実行 | `POST /api/cron/renewal-notifications?asOfYmd=…`（Bearer: `RENEWAL_JOB_SECRET`） |
| データ | Prisma Studio で `contractDate` / `nextRenewalDate` / `notifyEnabled` をケースごとに設定 |

| ID | 内容 | 結果 |
|----|------|------|
| M1 | `asOfYmd=2026-10-12` → `phase2.advancedSubscriptions: 6` / `phase1.sentSubscriptions: 2`（ダイジェスト1通・Test2 10/13・Vercel 10/16） | Pass |
| M2 | 同一 `asOfYmd=2026-10-12` 再実行 → メール再送なし | Pass |
| TC1 | 月次・複数サイクル（contract 06/02・stored 08/02・asOf 10/12）→ `phase2: 1` / 更新日 11/02・Phase1 送信なし（notify OFF） | Pass |
| TC4 | 更新日当日（stored=asOf `2026-09-12`）→ `phase2.advancedSubscriptions: 0`（繰り上げなし） | Pass |
| TC8 | 年次・複数サイクル（contract 2023-03-01・stored 2024-03-01・asOf 2026-07-28）→ `phase2: 1`（期待更新日 2027-03-01） | Pass |

### 補足（Hybrid B）

- 中間サイクルへのメール遡及は行わない（仕様どおり）。
- Secret の値・実行ログの詳細はドキュメントに記載しない。
- ロールバック対象は主に `daily-job.ts` と関連テスト／ルール。スキーマ変更なし。

## 追記: シェル max 1000px / セクション枠デザイン統一（2026-07-29）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-29 |
| コマンド | `npx vitest run src/components/features/subscription/subscription-section-frame.test.ts src/components/features/subscription/SubscriptionRenewalNotice.test.tsx src/components/features/subscription/SubscriptionSummaryCards.test.tsx src/components/features/subscription/SubscriptionListTable.test.tsx src/components/features/subscription/SubscriptionRegistrationForm.layout.test.tsx src/components/features/subscription/SubscriptionDeleteForm.layout.test.tsx src/components/features/subscription/AppShell.test.tsx` |
| 環境 | Node.js v24.15.0 / Vitest v4.1.10 |
| 結果 | **7 files passed / 13 tests passed / 0 failed** |

### 追加ファイル

| ファイル | 内容 |
|----------|------|
| `subscription-section-frame.test.ts` | お知らせ枠・テーブル枠クラス定数 |
| `SubscriptionRenewalNotice.test.tsx` | 枠クラス・見出し位置・複数行表示 |
| `SubscriptionSummaryCards.test.tsx` | 各カード白 2px・全幅 |
| `SubscriptionListTable.test.tsx` | 幅連動廃止・テーブル枠・中央寄せ |
| `SubscriptionRegistrationForm.layout.test.tsx` | 登録画面テーブル枠・ガイド箱 |
| `SubscriptionDeleteForm.layout.test.tsx` | 削除画面テーブル枠・空状態 |
| `AppShell.test.tsx` | 右側領域 `max-w-[1000px]` |

## 追記: 使い方ページ刷新 / `useEffect` 整理（2026-07-31）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-31 |
| コマンド | `npx vitest run`（全体）／`npx tsc --noEmit` |
| 環境 | Node.js v24.15.0 / Vitest v4.1.10 |
| 結果 | **28 files passed / 132 tests passed / 0 failed**（型エラーなし） |

### 使い方ページ（5 セクション化）

旧 `GuideSteps` / `GuideStepCardWrapper` のカード構成を廃止し、黒背景・白 2px 枠の 5 セクション構成へ差し替え。

| ケース | 内容 | 結果 |
|--------|------|------|
| 見出し維持 | タイトルは維持し、旧ステップカードは表示しない | Pass |
| 枠構造 | 各セクションの見出しは枠の外、本文は黒背景・白 2px 枠の中 | Pass |
| 番号付き手順 | データの登録方法は番号付き手順を枠内に表示する | Pass |
| 注記の縮小 | 「※」始まりの行だけ 14px に縮小する | Pass |
| 強調矩形 | 囲み記号で指定した語だけ背景色付きの矩形にする | Pass |
| 字下げ | 手順本文の字下げはデスクトップのみ効かせる（モバイルは左詰め） | Pass |
| マーカー除去 | 囲み記号は本文に残さない | Pass |
| 説明画像 | 画像を持つセクションだけ、白枠の中に実寸比で画像を表示する | Pass |
| 画像なし | データの登録方法は説明画像を持たない | Pass |

### `useEffect` 整理（`react-hooks/set-state-in-effect`）

| 対象 | 変更内容 | 結果 |
|------|----------|------|
| `AppShell.tsx` | パス変化でのモバイルサイドバー閉じを effect からレンダー中の state 調整へ変更（戻る／進むでも閉じる挙動は維持） | Pass |
| `SubscriptionNameHeaderCell.tsx` | `useIsVisibleInTableFrame` を `useEffect` + `RefObject` から **ref コールバック**へ移行。cleanup で `observer.disconnect()` と観測状態のリセットを行う | Pass |

`SubscriptionNameHeaderCell.test.tsx` に回帰ケースを 1 件追加（計 5 件）。

| ケース | 内容 | 結果 |
|--------|------|------|
| 持ち越し防止 | トリガーが外れると観測を解除し、再表示時に前回の表示状態を持ち越さない | Pass |

### 補足（2026-07-31）

- `vitest.setup.ts` に `window.matchMedia` のモックを追加。jsdom で `useSyncExternalStore` 経由のメディアクエリ参照が落ちる問題を解消。
- ref コールバックの cleanup は Radix の `composeRefs`（1.1.2 / 1.1.3）が返り値を回収するため、`TooltipTrigger asChild` 経由でも実行されることを実テストで確認。
- 削除ファイル: `GuideSteps.tsx` / `GuideStepCardWrapper.tsx` / `public/assets/guide_step1〜4.webp`

## 補足

- `NewPasswordSchema` / signup / profile の新パスワードはいずれも最小 **8** 文字（最大 128）。
- `isOAuthProvider` テストでは `@/lib/prisma` をモックし、`DATABASE_URL` なしでも実行可能にした。
- 層 A の日次ジョブは Prisma / `sendRenewalDigestEmail` をモック（実 SMTP なし）。
- アカウント削除 Action は `auth` / Prisma / SMTP / `signOut` / `redirect` をモック。
- 層 B/C の実行ログや Secret の値はドキュメントに記載しない。
- 再実行（層 A）: `npm run test:run`
