# subscription-memo（SubscMemo）

`Authentication` をベースにした本番向けアプリです。Next.js 16（App Router）+ Auth.js v5 + Prisma + Resend で認証まわりを実装しています。アプリのパス定義は `src/lib/routes.ts` を単一の情報源とし、Proxy は `src/proxy.ts` に置いています。

開発用 DB は Phase 2 で Docker Postgres を用意します。本番 URL 予定: `https://subscmemo.see-u-soon.design`


## 認証のしくみ（初心者向け）

ここでは「DB に何が保存されるか」と「どんなときログインできるか」を先に押さえます。セットアップ手順は後半のセクションを参照してください。

**用語メモ**
- **Credentials（クレデンシャル）**
 メールアドレスとパスワードをこのアプリに直接入力してログインする方式です。

- **OAuth**
 Google や GitHub の画面に一度遷移し、そちらで本人確認したあとにこのアプリへ戻る方式です。


### データの置き場（テーブルの役割）

データベースは PostgreSQL です。Prisma の「モデル」が、そのままテーブル（行と列の集まり）に対応します。中心は **`User`** で、ほかの表は「その人にぶら下がる情報」です。

`User`テーブル
**役割**
利用者 1 人分の土台。メール、`passwordHash`（パスワードのハッシュ）、表示名、プロフィール画像、TOTP 秘密鍵の有無などを持ちます。 |

`Account`テーブル
**役割**
OAuth 用の紐づけ 1 行が 1 レコードです。「どのプロバイダ（`google` / `github`）の、どの外部アカウント ID が、この `User` に属するか」を表します。同じメールでも、別プロバイダを勝手に同じユーザーにくっつける（自動リンク）はしません。 |

`Session`テーブル
**役割**
Auth.js の Adapter が使うセッション行です。ブラウザが持つログイン状態の主な形は後述の **JWT** ですが、OAuth フローなど Adapter 周りでこの表が使われることがあります。 |

`VerificationToken`テーブル
**役割**
Auth.js がメール確認などで使うワンタイム用トークンを置くための表です。 |

`BackupCode`テーブル
**役割**
MFA のバックアップコードを **ハッシュ** で保存します。使った行には使用日時が入り、再利用できません。

`PasswordResetToken`テーブル
**役割**
パスワード再設定用リンクのトークンを **ハッシュ** で保存し、有効期限や使用済みを管理します。 |

`LoginAttempt`テーブル
**役割**
MFA 検証などの試行が成功したかどうかを記録し、短時間に失敗が続いたときの制限（ロックアウト）の判定に使います。 |

**ブラウザの「ログイン中」はどこに？**  
このアプリでは **`session: { strategy: "jwt" }`**（`src/lib/auth.ts`）のため、ログイン後の状態は主に **Cookie に載る JWT** で表現されます。
上の **`User` や `Account` は「アカウント情報の正」**、JWT は「今このブラウザが誰としてログイン中か」の目印、と分けると整理しやすいです。


### ログインパターン一覧（状況 → 結果）

1. はじめて利用する場合（新規登録）
**メールとパスワードで登録**
結果: User が作成されます。次からパスワードでログイン可能です。

**Google または GitHub でログイン**
結果: User と Account（連携情報）が作成されます。次から同じボタンでログイン可能です。

2. すでに登録済みの場合（ログイン成功）
**メール・パスワードで登録済み** ➔ 正しいパスワードを入力
結果: 成功。

**Google で登録済み** ➔ Google ボタンをクリック
結果: 成功。

**GitHub で登録済み** ➔ GitHub ボタンをクリック
結果: 成功。

**パスワードと Google 両方を連携済み** ➔ どちらの方法でも
結果: 成功。

3. ログインに失敗する場合（注意点）
**登録済みだが、間違ったパスワードを入力**
結果: 失敗。「パスワードが違います」等のエラー。

**パスワードのみ登録済み** ➔ Google / GitHub ボタンをクリック
結果: 失敗。セキュリティのため、自動でアカウントを合体させることはありません。

**Google のみ登録済み** ➔ GitHub ボタン（同じメール）をクリック
結果: 失敗。勝手な別プロバイダへのリンクを禁止しているため、Google でログインし直す必要があります。

**SNS のみ登録済み** ➔ パスワードでログインしようとする
結果: 失敗。パスワードが設定されていないため、元の SNS ボタンからログインしてください。

**エラー時の挙動**
自動連携の禁止: 同じメールアドレスを使っていても、登録時と異なる方法でログインしようとするとブロックされます。

エラーメッセージ: OAuthAccountNotLinked などのエラーが出た場合は、「以前使った方法（またはパスワード）」でのログインが必要です。


**補足**
- 新規登録（`/signup`）で **すでに使われているメール** を指定した場合は、フォームのエラーで「既に登録されています」と伝わります（OAuth の「未リンク」ケースとは別ルートです）。
- **パスワードを忘れた**ときは `/forgot-password` から手続きします。メールアドレスが存在するかどうかを推測されにくいよう、画面メッセージは登録の有無に関わらず同じにしています。
- **MFA（二段階認証）** は、ログイン後に `/mfa/setup` で設定し、必要に応じて `/mfa/verify` でコードを確認する流れです。上の表は「メール／OAuth による本人確認」の段階に焦点を当てています。


## 認証要件（現時点）

- **認証方式**
 Credentials（メール + パスワード）と OAuth（Google / GitHub）

- **OAuth**
ドメイン制限なし（誰でもサインイン可能）

- **アカウントリンク**
 同一メールでも別プロバイダへの自動リンクは禁止。既存ユーザーに当該 OAuth が紐づいていない場合はログインを拒否し、`/login` に `error=OAuthAccountNotLinked` および補助クエリ（既存の連携プロバイダ・Credentials 登録の有無など）を付与して案内する

- **新規登録**
`/signup`（認証不要）

- **セッション**
 JWT 戦略（`src/lib/auth.ts`）。Prisma Adapter はアカウント連携用に利用

- **パスワードリセット**
`/forgot-password` で依頼、`/reset-password?token=...` で再設定（いずれも認証不要）。レスポンスは登録有無に関わらず同一（列挙対策）。メール送信失敗時はログに記録し、作成済みのリセットトークンを削除。OAuth のみのユーザーはトークンを発行せずログに記録（外部連携アカウント向けメールは運用ルール上の拡張ポイント）

- **MFA**
TOTP（認証アプリ）の設定 `/mfa/setup`（要ログイン）、検証 `/mfa/verify`（Proxy 上は未ログインでも到達可）。バックアップコードは 10 件をハッシュ保存し 1 回利用で失効。MFA 検証の失敗はユーザー単位で記録し、直近 15 分以内の失敗が閾値に達すると一時的に再試行を拒否（閾値・ウィンドウは `src/lib/mfa/lockout.ts`）

- **ログイン成功後の既定遷移**
`/success` で `Login Success!` を表示（Credentials の Server Action および OAuth の既定 `callbackUrl` と整合）


## ルート保護（`src/proxy.ts`）

- **方針**: 下記「認証スキップ」以外のパスは、セッション Cookie が無い場合 `/login` へリダイレクトする。リダイレクト時は元パスを `callbackUrl` クエリに付与する

- **認証スキップ（`PROXY_PUBLIC_PATH_PREFIXES`）**: `/login`、`/signup`、`/forgot-password`、`/reset-password`、`/mfa/verify`、`/api/auth`（Auth.js のコールバック干渉回避）

- **静的・フレームワーク配下（`PROXY_IGNORED_PATH_PREFIXES`）**: `/_next`、`/favicon.ico` など。Next の `public/` フォルダのファイルは URL 上はルート直下（例: `/favicon.ico`）として配信され、パス `/public/...` としては扱わない

- **matcher**: `_next/static`、`_next/image`、`favicon.ico` は `config.matcher` 側でも除外（Next.js の静的解析の都合で `src/proxy.ts` 内にリテラル記述）

## ログイン画面のエラー表示

- `/login?error=...` を主とし、`OAuthAccountNotLinked` 時は追加クエリで文言を出し分け
- 列挙や過度な情報露出に配慮したメッセージ設計（詳細は `.cursor/rules/auth-nextjs16.mdc`）

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
- `RESEND_API_KEY`
- `EMAIL_FROM`

## 開発コマンド

```bash
npm run dev
npm run lint
npm run build
```

## ルール参照

- 共通: `.cursor/rules/common.mdc`
- 認証: `.cursor/rules/auth-nextjs16.mdc`
- セキュリティ: `.cursor/rules/security.mdc`
- フォーム: `.cursor/rules/form-handling.mdc`
- メール: `.cursor/rules/email-smtp.mdc`
