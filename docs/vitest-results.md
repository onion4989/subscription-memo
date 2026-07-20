# Vitest / 更新お知らせジョブ 実施結果（P0〜P2 + 層 A〜C）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-21（更新お知らせジョブ 層 A〜C）／初回 P0–P2: 2026-07-19 |
| コマンド（層 A） | `npm run test:run` |
| 環境（層 A） | Node.js v24.15.0 / Vitest v4.1.10 |
| 結果（層 A） | **13 files passed / 74 tests passed / 0 failed** |
| 除外 | V4（email / subscription レートリミット） |

## スコープ

- **含む**: P0 → P1 → P2（M2 TOTP 含む）、更新お知らせ日次ジョブ（層 A: SMTP モック / 層 B: 本番実送信 / 層 C: Dokploy Scheduled Tasks）
- **含まない**: V4、Server Actions 結合、Playwright E2E（更新お知らせ以外）

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
| お知らせ | `src/lib/renewal-notification/daily-job.test.ts` | J1–J7 |
| お知らせ | `src/app/api/cron/renewal-notifications/route.test.ts` | C1–C4 |

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
| J7 | Phase2 で期限切れ更新日を翌サイクルへ | Pass |
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

## 補足

- `NewPasswordSchema` / signup / profile の新パスワードはいずれも最小 **8** 文字（最大 128）。
- `isOAuthProvider` テストでは `@/lib/prisma` をモックし、`DATABASE_URL` なしでも実行可能にした。
- 層 A の日次ジョブは Prisma / `sendRenewalDigestEmail` をモック（実 SMTP なし）。
- 層 B/C の実行ログや Secret の値はドキュメントに記載しない。
- 再実行（層 A）: `npm run test:run`
