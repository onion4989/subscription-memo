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

## 追記: MFA バックアップコード（2026-08-01）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-08-01 |
| コマンド | `npx vitest run`（全体）／`npx tsc --noEmit`／`npm run lint` |
| 環境 | Node.js v24.15.0 / Vitest v4.1.10 |
| 結果 | **32 files passed / 155 tests passed / 0 failed**（型エラーなし） |

MFA 有効化時にバックアップコードを 10 件発行し、`/mfa/verify` で TOTP の代わりに使えるようにした。`bcryptjs` / Prisma はモックし、DB なしで実行できる。

### `src/lib/mfa/backup-codes.test.ts`（12 件）

| ケース | 内容 | 結果 |
|--------|------|------|
| 件数・桁数 | 既定で 10 文字 × 10 件を重複なく生成する | Pass |
| 文字集合 | `I` / `L` / `O` / `U` を含まない Crockford Base32 だけを使う | Pass |
| 表示整形 | 10 文字を 4-4-2 のハイフン区切りで表示する | Pass |
| 入力正規化 | 小文字・ハイフン・空白を除去する | Pass |
| 転記ゆれ | `O` → `0`、`I` / `L` → `1` に読み替える | Pass |
| 往復 | 整形した文字列は正規化で元に戻る | Pass |
| 発行 | 表示用コードとハッシュを 10 件ずつ返し、平文は保存行に現れない | Pass |
| 消費（成功） | 一致した 1 件だけを使用済みにして `true` を返す | Pass |
| 消費（不一致） | 一致しないときは何も更新しない | Pass |
| 桁数不正 | 桁数が合わない入力では DB を参照しない | Pass |
| 競合 | 同時送信で先に使われていた場合は `false` を返す | Pass |
| 絞り込み | 未使用かつ本人のコードだけを照合対象にする | Pass |

### `src/lib/actions/mfa-setup.test.ts`（3 件）

| ケース | 内容 | 結果 |
|--------|------|------|
| 同一トランザクション | 有効化・旧コード削除・新規発行を 1 トランザクションで実行する | Pass |
| 認証コード誤り | TOTP が誤りのときは何も書き込まない | Pass |
| 書き込み失敗 | 失敗時は入力画面へ戻し、コードを返さない | Pass |

### `src/lib/actions/mfa-verify.test.ts`（6 件）

| ケース | 内容 | 結果 |
|--------|------|------|
| 認証成功 | バックアップコードが一致するとセッションを MFA 済みにする | Pass |
| 認証失敗 | 不一致は失敗として記録し、セッションを更新しない | Pass |
| 空入力 | 空のときは照合そのものを行わない | Pass |
| ロック中 | ロック中はバックアップコードも受け付けない | Pass |
| 既定経路 | `mode` 未指定のときは従来どおり TOTP を検証する | Pass |
| エラー帰属 | TOTP のエラーは `mode: "totp"` として返す（入力切替時に前のエラーを残さない） | Pass |

### `src/lib/actions/mfa-disable.test.ts`（2 件）

| ケース | 内容 | 結果 |
|--------|------|------|
| 解除時削除 | 解除と同時に残っているバックアップコードを削除する | Pass |
| パスワード誤り | パスワードが誤りのときは削除しない | Pass |

### 補足（2026-08-01）

- `MfaSetupCompleteView` を廃止し、完了メッセージはバックアップコード画面へ統合。あわせて `MfaSetupFlow` の `autoNotifyOnComplete` と完了通知用 `useEffect` を削除した（コードを控える前にダイアログが閉じないようにするため）。
- `MfaSetupState.step` の `"complete"` を `"backup-codes"` に置き換え。サーバーが返さない状態を型から外した。
- `MfaSetupClient` の未使用 `Button` インポートを削除（ESLint 警告 1 件を解消）。
- 残る ESLint エラーは `MfaDisableDialog.tsx:41` の 1 件のみで、これは保留中の既知事項。

## 追記: MFA 解除後のダイアログ表示バグ修正（2026-08-01）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-08-01 |
| コマンド | `npx vitest run` |
| 結果 | **33 ファイル / 158 件すべて Pass** |

`MfaSettingsDialog` は設定直後に `router.refresh()` が反映されるまでの間だけ有効表示を保つため、クライアント状態 `setupCompleted` を持つ。このフラグが MFA 解除後も残り、同一ページのままダイアログを開き直すと「二段階認証は有効です」と表示されていた。`totpEnabled` の変化を描画中に検知して `setupCompleted` を落とす state 調整で解消した（`useEffect` を増やさない方針は `AppShell` と同じ）。

### `src/components/features/settings/MfaSettingsDialog.test.tsx`（3 件）

Server Action を伴う登録フローは扱えないため、`MfaSetupFlow` は `onComplete` を呼ぶだけのスタブに差し替え、`initMfaSetup` と `useRouter` をモックしている。

| ケース | 内容 | 結果 |
|--------|------|------|
| 未設定 | `totpEnabled: false` では登録フローを表示する | Pass |
| 設定済み | `totpEnabled: true` では有効である旨のみ表示し、`initMfaSetup` を呼ばない | Pass |
| 解除後 | 設定完了 → 有効 → 解除 と props が変化した後、有効表示を持ち越さず登録フローに戻る | Pass |

「解除後」のケースは修正を一時的に無効化した状態で失敗することを確認済み。

## 追記: デモアカウント（2026-08-02）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-08-02 |
| コマンド | `npx vitest run` |
| 結果 | **36 ファイル / 170 件すべて Pass** |

デモアカウント（`demo@example.com`）の初期化・ガード・Cron を追加。通常ユーザー向けロジックは `isDemoUserEmail` 分岐のみ。

| 対象 | 件数 | 内容 |
|------|------|------|
| `src/lib/demo/constants.test.ts` | 3 | 定数・メール判定・シード 6 件（notify OFF） |
| `src/lib/demo/reset-demo-account.test.ts` | 1 | upsert / 関連削除 / 再投入 |
| `src/app/api/cron/demo-reset/route.test.ts` | 4 | secret 未設定 / 401 / 不正日付 / 成功 |
| `mfa-setup.test.ts` / `delete-account.test.ts` | +2 | デモユーザーの MFA 有効化・削除を拒否 |

実 DB では `npm run demo:reset` 後に `npx tsx scripts/verify-demo-user.ts` で、確認済み・パスワード一致・通知停止・サブスク 6 件を確認済み。

## 補足

- `NewPasswordSchema` / signup / profile の新パスワードはいずれも最小 **8** 文字（最大 128）。
- `isOAuthProvider` テストでは `@/lib/prisma` をモックし、`DATABASE_URL` なしでも実行可能にした。
- 層 A の日次ジョブは Prisma / `sendRenewalDigestEmail` をモック（実 SMTP なし）。
- アカウント削除 Action は `auth` / Prisma / SMTP / `signOut` / `redirect` をモック。
- 層 B/C の実行ログや Secret の値はドキュメントに記載しない。
- 再実行（層 A）: `npm run test:run`

## 追記: 公開認証フォームのレートリミット（2026-09-04）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-09-04 |
| 対象 | login / forgot-password のインメモリ RL（`AUTH_RATE_LIMIT_ENABLED` で無効化可） |
| 環境 | Node.js v25.9.0 / Vitest v4.1.10 |

### スコープ別コマンドと結果

| 段階 | コマンド | 結果 |
|------|---------|------|
| V1+V3 | `npm run test:run -- src/lib/auth/auth-form-rate-limit.test.ts src/lib/actions/login.rate-limit.test.ts src/lib/actions/forgot-password.rate-limit.test.ts src/components/features/auth/LoginForm.form-error.test.tsx` | **4 files / 14 passed** |
| V2 | `npm run test:run -- src/schemas/index.test.ts` | **1 file / 6 passed** |
| V4 | `npm run test:run`（全体） | **45 passed / 1 failed（46 files）** · **208 passed / 2 failed（210 tests）** |

V4 の失敗 2 件は `subscription-section-frame.test.ts`（`bg-black` 期待 vs 実装の `bg-[var(--app-table-frame)]`）。今回の RL 変更とは無関係の既存ずれ。

### 新規・追加ケース

| ID | ファイル | 内容 | 結果 |
|----|----------|------|------|
| RL1–RL7 | `src/lib/auth/auth-form-rate-limit.test.ts` | 窓内許可・メール/IP 超過・独立・`AUTH_RATE_LIMIT_ENABLED=false` | Pass |
| L1–L2 | `src/lib/actions/login.rate-limit.test.ts` | 超過で `formError`・`signIn` 未呼出 / 許可時は認証継続 | Pass |
| F1–F2 | `src/lib/actions/forgot-password.rate-limit.test.ts` | 超過で `submitted: true`・SMTP 未呼出 / 許可時は user 照会 | Pass |
| UI1–UI3 | `src/components/features/auth/LoginForm.form-error.test.tsx` | 上部アラート表示・非表示・フィールドエラー併存 | Pass |
