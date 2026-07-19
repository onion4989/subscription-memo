# Vitest 実施結果（P0〜P2）

| 項目 | 内容 |
|------|------|
| 実施日 | 2026-07-19 10:39 JST |
| コマンド | `npm run test:run` |
| 環境 | Node.js v24.15.0 / Vitest v4.1.10 |
| 結果 | **11 files passed / 62 tests passed / 0 failed** |
| 除外 | V4（email / subscription レートリミット） |

## スコープ

- **含む**: P0 → P1 → P2（M2 TOTP 含む）
- **含まない**: V4、Server Actions 結合、Playwright E2E

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

## 補足

- `NewPasswordSchema` / signup / profile の新パスワードはいずれも最小 **8** 文字（最大 128）。
- `isOAuthProvider` テストでは `@/lib/prisma` をモックし、`DATABASE_URL` なしでも実行可能にした。
- 再実行: `npm run test:run`

## 次のステップ（任意）

- Playwright E2E（ログイン〜画面遷移など）
- Server Actions / Prisma 周りの結合テスト（モックまたはテスト DB）
