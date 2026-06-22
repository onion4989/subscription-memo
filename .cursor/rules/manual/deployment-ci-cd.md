# CI/CD デプロイ手順書（GitHub Actions + GHCR + Dokploy）

本番デプロイの構成・初回セットアップ・日常運用をまとめたドキュメントです。  
AI 向けルールは `.cursor/rules/`、本書は人間向けの運用記録です。

---

## 1. 背景と目的

### 課題

- 本番 VPS（エックスサーバー **6GB** / Ubuntu 24.04）で Dokploy + Nixpacks ビルドを行うと、メモリ不足でビルドが不安定・遅い
- `next build` は 1.2〜2GB 以上のメモリを使うことがあり、本番コンテナとビルドが同じ VPS で競合する

### 解決策

- **ビルド**: GitHub Actions（GitHub のランナー上）で Docker イメージを作成
- **配布**: GitHub Container Registry（GHCR）に push
- **本番**: Dokploy は完成済みイメージを pull して起動するだけ（VPS 上ではビルドしない）
- **DB**: Dokploy Postgres（アプリごとに Postgres サービスを作成。Neon / Vercel は使用しない）
- **メール**: Xserver SMTP（portfolio と同様の `MY_EMAIL` / `MY_PASSWORD`）

---

## 2. 全体の流れ

```
開発者が main に push
    ↓
GitHub Actions が起動
    ├─ Docker マルチステージビルド
    │   ├─ npm ci
    │   ├─ prisma generate
    │   ├─ next build（standalone）
    │   └─ ランタイムイメージ作成
    └─ GHCR に push（:latest と :<commit-sha>）
    ↓
Dokploy Webhook を POST
    ↓
Dokploy が ghcr.io からイメージを pull
    ↓
コンテナ起動（prisma migrate deploy → node server.js）
    ↓
https://subscmemo.see-u-soon.design で公開
```

### 環境の役割分担

| 環境 | 役割 |
|---|---|
| Local (WSL2) | 開発・`npm run dev` / `npm run build` で動作確認 |
| GitHub Actions | 本番用 Docker イメージのビルド・GHCR への push |
| GHCR | ビルド済みイメージの保管 |
| Dokploy (VPS 6GB) | イメージの pull・コンテナ起動・ドメイン・SSL（Let's Encrypt） |
| Dokploy Postgres | 本番 DB（Subscription MEMO 専用インスタンス） |
| Xserver SMTP | 確認メール・パスワードリセット送信 |

---

## 3. リポジトリ内の関連ファイル

| ファイル | 役割 |
|---|---|
| `Dockerfile` | マルチステージビルド（deps → builder → runner） |
| `.dockerignore` | ビルドコンテキストから不要ファイルを除外 |
| `scripts/docker-entrypoint.sh` | 起動時に `prisma migrate deploy` を実行 |
| `.github/workflows/deploy.yml` | push 時のビルド・GHCR push・Dokploy Webhook 呼び出し |
| `next.config.ts` | `output: 'standalone'` で本番用最小構成を出力 |
| `prisma.config.ts` | Prisma CLI 用の `DATABASE_URL` 設定 |
| `docker-compose.yml` | **ローカル開発用** Postgres のみ（本番では不使用） |

### Docker イメージ名

```
ghcr.io/onion4989/subscription-memo:latest
ghcr.io/onion4989/subscription-memo:<commit-sha>
```

### GitHub リポジトリ

- https://github.com/onion4989/subscription-memo
- デフォルトブランチ: `main`

---

## 4. 環境変数

### デプロイ連携用（GitHub Secrets に登録）

| Secret 名 | 用途 |
|---|---|
| `DOKPLOY_DEPLOY_WEBHOOK_URL` | Actions 成功後に Dokploy へデプロイを指示する Webhook URL |

> Webhook URL はデプロイを起動できる鍵と同じ。**リポジトリやこのファイルに直書きしない。**  
> Dokploy の **Works > Subscription MEMO** サービス設定画面から取得する。

本アプリは `NEXT_PUBLIC_*` を使わないため、**ビルド時に GitHub Secrets へアプリの機密を載せる必要はない**（ランタイムは Dokploy に集約）。

### ランタイム（Dokploy に登録）

| 変数 | 用途 | 登録先 |
|---|---|---|
| `DATABASE_URL` | Dokploy Postgres 接続文字列 | Dokploy のみ |
| `AUTH_SECRET` | セッション署名（本番専用で生成） | Dokploy のみ |
| `AUTH_TRUST_HOST` | リバースプロキシ向け（`true`） | Dokploy |
| `AUTH_URL` | `https://subscmemo.see-u-soon.design` | Dokploy |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth（後日設定可） | Dokploy |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth（後日設定可） | Dokploy |
| `SMTP_HOST` | Xserver SMTP ホスト（例: `sv1234.xserver.jp`） | Dokploy のみ |
| `SMTP_PORT` | 通常 `465` | Dokploy |
| `MY_EMAIL` | 送信元・SMTP 認証ユーザー | Dokploy のみ |
| `MY_PASSWORD` | Xserver メールパスワード | Dokploy のみ |

### ローカル開発

- `.env` に上記を設定（`.gitignore` 済み、コミットしない）
- DB は `docker compose up -d` でローカル Postgres を起動

---

## 5. GitHub 設定

### 5.1 Repository Secrets の登録

1. https://github.com/onion4989/subscription-memo/settings/secrets/actions を開く
2. **New repository secret** で `DOKPLOY_DEPLOY_WEBHOOK_URL` を登録

### 5.2 Workflow permissions

1. https://github.com/onion4989/subscription-memo/settings/actions を開く
2. **Workflow permissions** → **Read and write permissions** を選択して保存

GHCR への push に必要。

### 5.3 ビルド結果の確認

| 確認場所 | URL |
|---|---|
| Actions 実行ログ | https://github.com/onion4989/subscription-memo/actions |
| コンテナイメージ | https://github.com/onion4989/subscription-memo/pkgs/container/subscription-memo |

---

## 6. Dokploy 設定

### プロジェクト・サービス情報

| 項目 | 値 |
|---|---|
| Project | **Works** |
| Application | **Subscription MEMO** |
| 本番 URL | https://subscmemo.see-u-soon.design |
| Port | `3000` |
| SSL | Dokploy（Let's Encrypt） |

### Postgres（本番 DB）

- **アプリごとに Postgres サービスを作成**（portfolio とは別インスタンス）
- Subscription MEMO 用の DB 名・ユーザー・パスワードを決め、`DATABASE_URL` をアプリの環境変数に設定
- 接続ホストは Dokploy の内部サービス名（`localhost` ではない場合あり）

### Provider（重要）

**GitHub + Nixpacks ではなく、Docker Provider を使う。**

| 項目 | 値 |
|---|---|
| Provider | **Docker** |
| Docker Image | `ghcr.io/onion4989/subscription-memo:latest` |
| Registry URL | `ghcr.io` |
| Username | `onion4989` |
| Password | GitHub PAT（`read:packages` 権限） |

### GitHub PAT の作成（Dokploy 用）

1. https://github.com/settings/tokens を開く
2. **Generate new token (classic)**
3. Scope: **`read:packages`** にチェック
4. 発行された `ghp_...` を Dokploy の Password に貼り付け

> portfolio で発行済みの PAT を流用できる。

### Webhook

- **Works > Subscription MEMO** の Deploy Webhook URL を GitHub Secret `DOKPLOY_DEPLOY_WEBHOOK_URL` に登録
- GitHub Actions がイメージ push 成功後に `curl -X POST` で呼び出す

### OAuth（後日）

本番ドメイン確定後、各プロバイダでコールバック URL を登録する。

- `https://subscmemo.see-u-soon.design/api/auth/callback/google`
- `https://subscmemo.see-u-soon.design/api/auth/callback/github`

---

## 7. 初回セットアップ手順（チェックリスト）

実施順序を守ること。GHCR にイメージがない状態で Dokploy を Docker に切り替えると pull に失敗する。

- [ ] VPS を **6GB** にアップグレード
- [ ] DNS: `subscmemo.see-u-soon.design` → VPS の IP
- [ ] Dokploy で **Works** プロジェクトに **Subscription MEMO** アプリを作成
- [ ] Dokploy で **Subscription MEMO 用 Postgres** を作成し、`DATABASE_URL` を用意
- [ ] GitHub Secret `DOKPLOY_DEPLOY_WEBHOOK_URL` を登録
- [ ] GitHub Actions の Workflow permissions を Read and write に設定
- [ ] リポジトリに CI/CD ファイルを push（`main`）
- [ ] GitHub Actions が成功することを確認
- [ ] GHCR に `ghcr.io/onion4989/subscription-memo:latest` があることを確認
- [ ] GitHub PAT（`read:packages`）を Dokploy に設定
- [ ] Subscription MEMO の Provider を **Docker** に設定
- [ ] Dokploy の環境変数（§4）を登録
- [ ] Dokploy で手動 Deploy を実行し、Done（緑）になることを確認
- [ ] https://subscmemo.see-u-soon.design で動作確認

### 動作確認項目

- [ ] トップ / ランディング
- [ ] ログイン（Credentials / Google / GitHub ※OAuth 設定後）
- [ ] 新規登録・メール確認・再送
- [ ] パスワードリセット
- [ ] MFA 設定・検証
- [ ] `/subscriptions/new` 登録・修正
- [ ] `/subscriptions` 一覧
- [ ] サイドバー・ガイドページ

---

## 8. 日常の運用

### コードを本番反映する

```bash
git push origin main
```

これだけで以下が自動実行される。

1. GitHub Actions がビルド・GHCR push
2. Dokploy Webhook で本番が更新

### 環境変数を変更した場合

| 変更する変数 | 必要な作業 |
|---|---|
| `AUTH_URL` / OAuth 系 | Dokploy の env を更新 → **Dokploy で Redeploy** |
| `MY_EMAIL` / `MY_PASSWORD` / `SMTP_HOST` | Dokploy の env を更新 → **Dokploy で Redeploy** |
| `DATABASE_URL` | Postgres 設定確認 → **Dokploy で Redeploy** |

### 手動でワークフローを実行する

GitHub Actions タブ → **Build and Push Docker Image** → **Run workflow**（`workflow_dispatch` 対応）

---

## 9. トラブルシューティング

| 症状 | 確認・対処 |
|---|---|
| Actions が Webhook スキップ | `DOKPLOY_DEPLOY_WEBHOOK_URL` が未登録。Secret 登録後に再実行 |
| GHCR push 失敗 | Workflow permissions が Read and write か確認 |
| Dokploy pull 失敗 | Image 名、Registry URL、PAT（`read:packages`）を確認 |
| コンテナ起動直後に DB エラー | `DATABASE_URL`、Postgres の起動状態、`prisma migrate deploy` のログを確認 |
| Dokploy Done だがサイトが 502 | Port `3000`、コンテナログを確認 |
| メールが届かない | `SMTP_HOST` / `MY_EMAIL` / `MY_PASSWORD`、Xserver メール設定を確認 |
| OAuth リダイレクト不一致 | `AUTH_URL` とプロバイダ側コールバック URL の一致を確認 |
| 変更が本番に反映されない | Actions 成功 → GHCR の `latest` 更新時刻 → Dokploy のデプロイログを確認 |

---

## 10. セキュリティ上の注意

- `.env`、Webhook URL、GitHub PAT、SMTP パスワード、`AUTH_SECRET` は **Git にコミットしない**
- Webhook URL が漏れた場合は Dokploy で再発行し、GitHub Secret を更新する
- GitHub PAT は Dokploy 用に `read:packages` のみで十分（pull 専用）
- `MY_EMAIL` / `MY_PASSWORD` は GitHub Secrets に入れない（Dokploy のみ）

---

## 11. 旧方式との比較

| 項目 | 旧方式（Nixpacks） | 現方式（GHCR + Docker） |
|---|---|---|
| ビルド場所 | VPS 上 | GitHub Actions |
| Dokploy Provider | GitHub | Docker |
| VPS メモリ負荷 | 高い（ビルド時） | 低い（pull のみ） |
| デプロイトリガー | Git push → Dokploy ビルド | Git push → Actions → Webhook |
| DB | — | Dokploy Postgres（アプリごと） |

---

## 12. 関連ドキュメント

| ファイル | 内容 |
|---|---|
| `.cursor/rules/common.mdc` | テクニカルスタック・Next.js 16 方針 |
| `.cursor/rules/auth-nextjs16.mdc` | 認証・メール確認 |
| `.cursor/rules/email-smtp.mdc` | Xserver SMTP 送信 |
| `.cursor/rules/security.mdc` | セキュリティ |
| `README.md` | セットアップ・認証概要 |

---

*最終更新: 2026-06-22（subscription-memo 向け CI/CD 整備）*
