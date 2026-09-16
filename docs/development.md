# 開発ガイド

SubscMemo のセットアップ・開発・デプロイ手順です。プロダクト概要は [README](../README.md)、認証の詳細は [認証の設計](./authentication.md) を参照してください。

## バージョン方針

- Node.js はリポジトリ直下の `.nvmrc` を正とする（現在: `24.15.0` / Latest LTS）
- 開発・CI・本番で Node の同一メジャーを維持する
- Auth.js は `v5` 系を使用する（`next-auth@5`）
- Prisma は `7` 系を使用する
- Prisma `7` 系は Node.js `20.19+ / 22.12+ / 24+` が要件

## セットアップ

```bash
nvm use
npm install
cp .env.example .env
npx prisma generate
```

`.env` 必須項目:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`
- `AUTH_URL`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`（通常 `465`）
- `MY_EMAIL`
- `MY_PASSWORD`
- `RENEWAL_JOB_SECRET`（更新リマインダー Cron 用）
- `DEMO_RESET_JOB_SECRET`（デモアカウント日次リセット Cron 用）
- `AUTH_RATE_LIMIT_ENABLED`（任意。`false` で login / forgot-password のレートリミットを無効化。未設定は有効）
- `BLOCK_SEARCH_INDEXING`（任意。`true` で `robots.txt` の全拒否・各ページの noindex・`sitemap.xml` の空化。未設定は検索に載る）

`BLOCK_SEARCH_INDEXING` は **`next build` の時点で確定します**。`robots.txt` / `sitemap.xml` と `/signup` などの静的ページは事前生成されるため、**Dokploy の環境変数を後から変えても切り替わりません**。本番は `Dockerfile` の `ARG BLOCK_SEARCH_INDEXING`（既定 `true`）に GitHub のリポジトリ変数を `build-args` で渡す形で決めています。値を変えるときはイメージの再ビルドが必要です。

ローカル DB を使う場合:

```bash
docker compose up -d
```

`DATABASE_URL` の例: `postgresql://postgres:postgres@localhost:5432/subscription_memo_dev`

マイグレーションを適用する場合:

```bash
npx prisma migrate dev
```

## 開発コマンド

```bash
npm run dev        # 開発サーバー
npm run lint       # ESLint
npm run typecheck  # TypeScript 型チェック
npm run build      # 本番ビルド
npm run test:run   # Vitest
npm run test:e2e   # Playwright
npm run demo:reset # デモアカウントを初期状態へ（ローカル）
# 本番 DB 向け:
# npm run demo:reset -- --confirm-production
```

## e2e のアカウント

`npm run test:e2e` は最初に 1 回だけログインし、その結果（`e2e/.auth/user.json`）を全 spec で使い回します。spec ごとにログインすると同一 IP のレートリミット（15 分に 30 回）へすぐ到達するためです。ログイン動線そのものを見る spec と、MFA・デモ・新規登録の spec は、未ログインから始めます。

`.env.local` には 3 種類のアカウントを設定します。

| 環境変数 | 用途 |
|---|---|
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | 共有セッション用。一覧・設定・使い方などの大半の spec が使う |
| `E2E_MFA_USER_EMAIL` / `E2E_MFA_USER_PASSWORD` | MFA 専用。**共有セッション用とは別のアドレスにする** |
| `E2E_SIGNUP_EMAIL` / `E2E_SIGNUP_PASSWORD` | 新規登録とメール確認用（IMAP で受信する） |

MFA 用を共有セッション用と同じアカウントにすると、`p2-mfa` が MFA を有効化した瞬間に設定画面の spec が「二段階認証は有効です」を見て失敗します。`.env.local` に別アドレスを書いたうえで、次を実行してアカウントを用意してください。

```bash
npm run e2e:create-mfa-user # MFA 専用アカウントを作成（メール確認済み・MFA 無効）
npm run e2e:reset-mfa       # MFA が有効なまま残ったときの復旧
```

ログインが上限に達すると spec は「Login rate limit reached」で即座に止まります。dev サーバーを再起動すると窓がリセットされます（再起動時は `.next` を削除してください）。

## デモアカウント

公開デモ用の固定アカウントです（`demo@example.com` / `demo1234`）。通常ユーザーのロジックには影響しません。

| 項目 | 内容 |
|---|---|
| コア処理 | `src/lib/demo/reset-demo-account.ts`（サブスク再投入に加え OAuth `Account` / `Session` も削除） |
| 手動リセット | `npm run demo:reset`（本番は `--confirm-production` 必須） |
| 日次 Cron | `POST /api/cron/demo-reset`（`Authorization: Bearer $DEMO_RESET_JOB_SECRET`） |
| ガード | MFA 設定・アカウント削除・メール／パスワード変更を UI と Server Action の両方で拒否。**OAuth（Google / GitHub）も不可** |

Cron は更新リマインダーと同様に Dokploy 等から **1 日 1 回**呼び出してください。任意で `?asOfYmd=YYYY-MM-DD` を付けて基準日を固定できます。

## ディレクトリ構成

```
src/
├── app/                    # App Router（画面・Route Handler）
│   ├── (app)/              # 要ログインのページ群
│   └── api/cron/           # 日次バッチ用エンドポイント
├── components/
│   ├── features/           # 機能単位のコンポーネント
│   └── ui/                 # shadcn/ui 由来の再利用パーツ
├── lib/
│   ├── actions/            # Server Actions
│   ├── mfa/                # TOTP・バックアップコード・ロックアウト
│   ├── renewal-notification/  # 更新通知の日次ジョブ
│   ├── demo/               # デモアカウントの初期化・判定
│   ├── subscription/       # 更新日計算・金額換算・集計
│   └── routes.ts           # パス定義の単一情報源
├── schemas/                # Zod スキーマ（クライアント・サーバー共用）
└── proxy.ts                # ルート保護
```

## 本番デプロイ

GitHub Actions で Docker イメージをビルドし、GHCR 経由で Dokploy（**Works > Subscription MEMO**）へデプロイします。詳細は `.cursor/rules/manual/deployment-ci-cd.md` を参照してください。

- イメージ: `ghcr.io/onion4989/subscription-memo:latest`
- トリガー: `main` ブランチへの push
- SSL: Dokploy（Let's Encrypt）
- 本番 URL: `https://subscmemo.see-u-soon.design`
- 本番 DB: Dokploy Postgres（VPS 6GB / Ubuntu 24.04 + Dokploy）

## ルール参照

- 共通: `.cursor/rules/common.mdc`
- 認証: `.cursor/rules/auth-nextjs16.mdc` / [authentication.md](./authentication.md)（CSRF・レートリミット一覧）
- セキュリティ: `.cursor/rules/security.mdc`
- フォーム: `.cursor/rules/form-handling.mdc`
- メール: `.cursor/rules/email-smtp.mdc`
- 命名（変数 20 / 定数 35）: `.cursor/rules/naming.mdc`
- 静的アセット命名（場所略語・旧→新・移行状況）: [asset-naming.md](./asset-naming.md)
- デプロイ: `.cursor/rules/manual/deployment-ci-cd.md`
