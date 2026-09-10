# 認証の設計

SubscMemo の認証まわりの詳細ドキュメントです。概要は [README](../README.md) を参照してください。

アプリのパス定義は `src/lib/routes.ts` を単一の情報源とし、Proxy は `src/proxy.ts` に置いています。

## 認証のしくみ

ここでは「DB に何が保存されるか」と「どんなときログインできるか」を先に押さえます。セットアップ手順は [開発ガイド](./development.md) を参照してください。

**用語メモ**

- **Credentials（クレデンシャル）**  
  メールアドレスとパスワードをこのアプリに直接入力してログインする方式です。

- **OAuth**  
  Google や GitHub の画面に一度遷移し、そちらで本人確認したあとにこのアプリへ戻る方式です。

### データの置き場（テーブルの役割）

データベースは PostgreSQL です。Prisma の「モデル」が、そのままテーブル（行と列の集まり）に対応します。中心は **`User`** で、ほかの表は「その人にぶら下がる情報」です。

`User`テーブル  
**役割**  
利用者 1 人分の土台。メール、`passwordHash`（パスワードのハッシュ）、表示名、プロフィール画像、TOTP 秘密鍵の有無などを持ちます。

`Account`テーブル  
**役割**  
OAuth 用の紐づけ 1 行が 1 レコードです。「どのプロバイダ（`google` / `github`）の、どの外部アカウント ID が、この `User` に属するか」を表します。同じメールでも、別プロバイダを勝手に同じユーザーにくっつける（自動リンク）はしません。

`Session`テーブル  
**役割**  
Auth.js の Adapter が使うセッション行です。ブラウザが持つログイン状態の主な形は後述の **JWT** ですが、OAuth フローなど Adapter 周りでこの表が使われることがあります。

`VerificationToken`テーブル  
**役割**  
Auth.js がメール確認などで使うワンタイム用トークンを置くための表です。

`BackupCode`テーブル  
**役割**  
MFA のバックアップコード用。MFA 有効化時に 10 件を発行し、bcrypt ハッシュのみを保存します。1 件使用すると `usedAt` が入り再利用できません。MFA 解除時は同一トランザクションで全件削除します。

`PasswordResetToken`テーブル  
**役割**  
パスワード再設定用リンクのトークンを **ハッシュ** で保存し、有効期限や使用済みを管理します。

`LoginAttempt`テーブル  
**役割**  
MFA 検証などの試行が成功したかどうかを記録し、短時間に失敗が続いたときの制限（ロックアウト）の判定に使います。

**ブラウザの「ログイン中」はどこに？**  
このアプリでは **`session: { strategy: "jwt" }`**（`src/lib/auth.ts`）のため、ログイン後の状態は主に **Cookie に載る JWT** で表現されます。  
上の **`User` や `Account` は「アカウント情報の正」**、JWT は「今このブラウザが誰としてログイン中か」の目印、と分けると整理しやすいです。

### ログインパターン一覧（状況 → 結果）

1. はじめて利用する場合（新規登録）

**メールとパスワードで登録**  
結果: User が作成され、確認メールが送信されます。メール内のリンク（有効期限1時間）を開いて `emailVerified` が設定されるまで、パスワードではログインできません。

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

- 新規登録（`/signup`）で **確認済みのメール** を指定した場合は、フォームのエラーで「既に登録されています」と伝わります。**未確認のメール** で再登録した場合は新規作成せず、確認メールを再送します（画面メッセージは共通化）。
- **メール確認**は `/verify-email?token=...` で完了します。届かない場合は `/resend-verification` から再送できます（レートリミットあり）。
- **パスワードを忘れた**ときは `/forgot-password` から手続きします。**メール未確認の Credentials ユーザー**にはリセットメールは送りません。画面メッセージは登録の有無に関わらず同じにしています。
- **MFA（二段階認証）** は、ログイン後に `/mfa/setup` で任意設定し、`totpEnabled` 時は `/mfa/verify` で認証アプリの 6 桁コードを確認する流れです。認証アプリが使えない場合は、設定時に控えたバックアップコードでも `/mfa/verify` を通過できます。上の表は「メール／OAuth による本人確認」の段階に焦点を当てています。

## CSRF（Server Actions）

ミューテーションは Server Actions（`'use server'`）経由が主です。**CSRF は Next.js の Origin チェックに依存**し、独自の CSRF トークンは発行しません。クロスオリジンの Action 呼び出しはフレームワーク側で拒否される前提です。詳細な数値・運用は `.cursor/rules/security.mdc` も参照。

## レートリミット一覧

公開・準公開の送信系は **単一インスタンス向けインメモリ**です。複数台にスケールする場合は共有ストア（例: Redis）への移行を検討してください。

### 公開認証フォーム（login / forgot）

実装: `src/lib/auth/auth-form-rate-limit.ts`。

| 対象 | 窓 | メール上限 | IP 上限 | 超過時 |
|---|---|---|---|---|
| `/login`（Credentials） | 15 分 | 10 | 30 | フォーム上部の共通アラート。DB / `signIn` に進まない |
| `/forgot-password` | 1 時間 | 5 | 10 | 成功画面のまま（列挙対策）。メールは送らない |

無効化（作業前相当の挙動に戻す）:

- 環境変数 `AUTH_RATE_LIMIT_ENABLED=false` を設定して Redeploy
- 未設定または `false` 以外は制限が有効

### 関連（別実装）

| 対象 | 窓 | 上限 | 実装 |
|---|---|---|---|
| メール確認再送（`/resend-verification` 等） | 1 時間 | メール 5 / IP 10 | `src/lib/email-verification/rate-limit.ts` |
| サブスク登録・更新系 | 1 分 | ユーザー 10 | `src/lib/subscription/rate-limit.ts` |

MFA 検証の失敗ロックアウト（`src/lib/mfa/lockout.ts`）はレートリミットとは別の防護です。

## 認証要件（現時点）

- **認証方式**  
  Credentials（メール + パスワード）と OAuth（Google / GitHub）

- **OAuth**  
  ドメイン制限なし（誰でもサインイン可能）

- **アカウントリンク**  
  同一メールでも別プロバイダへの自動リンクは禁止。既存ユーザーに当該 OAuth が紐づいていない場合はログインを拒否し、`/login` に `error=OAuthAccountNotLinked` および補助クエリ（既存の連携プロバイダ・Credentials 登録の有無など）を付与して案内する。  
  さらに、**既にログイン中の OAuth 追加リンクは拒否**（`OAuthWhileSignedIn`）。Auth.js 既定の「ログイン中に別プロバイダを押すと現ユーザーへ紐づく」挙動を防ぎ、デモアカウント汚染を避ける。  
  **デモアカウント（`demo@example.com`）では OAuth 不可**（`OAuthDemoForbidden`）。デモは Credentials 専用。日次 `demo-reset` はデモの `Account` / `Session` も削除する。

- **新規登録**  
  `/signup`（認証不要）。登録後に確認メールを送信し、リンククリックで `emailVerified` を設定するまで Credentials ログインは不可。OAuth（Google / GitHub）は確認メール不要

- **メール確認**  
  `/verify-email`（認証不要）、再送 `/resend-verification`（認証不要）。トークン有効期限は1時間。再送・送信失敗は構造化ログに記録

- **セッション**  
  JWT 戦略（`src/lib/auth.ts`）。Prisma Adapter はアカウント連携用に利用

- **パスワードリセット**  
  `/forgot-password` で依頼、`/reset-password?token=...` で再設定（いずれも認証不要）。レスポンスは登録有無に関わらず同一（列挙対策）。メール送信失敗時はログに記録し、作成済みのリセットトークンを削除。OAuth のみのユーザーはトークンを発行せずログに記録（外部連携アカウント向けメールは運用ルール上の拡張ポイント）

- **MFA（デモ）**  
  TOTP（Google Authenticator 等）の 6 桁コード、またはバックアップコード。Credentials ユーザーは任意（推奨）。OAuth は対象外。設定 `/mfa/setup`（要ログイン）、検証 `/mfa/verify`（ログイン直後・MFA 有効時）。`totpEnabled` のユーザーは Credentials ログイン後に `/mfa/verify` へ遷移し、JWT の `mfaVerified` が付与されるまで `(app)` 配下へ入れない。MFA 検証の失敗はユーザー単位で記録し、直近 15 分以内の失敗が閾値に達すると一時的に再試行を拒否（`src/lib/mfa/lockout.ts`）。ロック中はバックアップコードも受け付けない。バックアップコードは有効化時に 10 件（Crockford Base32・10 文字）を発行して一度だけ表示し、bcrypt ハッシュで保存・1 回で失効（`src/lib/mfa/backup-codes.ts`）。残数表示と再発行は未実装（方針は `.cursor/rules/auth-nextjs16.mdc` の「MFA 将来実装」参照）

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
