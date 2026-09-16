/**
 * アプリ内パスの単一情報源（Link / redirect / proxy / Auth.js と整合させる）
 */

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  /** アカウント（ニックネーム・メール・電話・パスワード・アバター） */
  account: "/account",
  /** 各種設定（お知らせ・MFA 導線） */
  settings: "/settings",
  /** ログイン後の互換リダイレクト用（実体は subscriptions） */
  success: "/success",
  subscriptions: "/subscriptions",
  subscriptionsNew: "/subscriptions/new",
  subscriptionsManage: "/subscriptions/manage",
  guide: "/guide",
  forgotPassword: "/forgot-password",
  verifyEmail: "/verify-email",
  resendVerification: "/resend-verification",
  resetPassword: "/reset-password",
  mfaSetup: "/mfa/setup",
  mfaVerify: "/mfa/verify",
  apiAuth: "/api/auth",
  /** 日次ジョブ（更新リマインダー / デモリセット。各エンドポイントで Bearer 保護） */
  apiCron: "/api/cron",
  /** 死活監視（Dokploy / 外部監視から未認証で叩く） */
  apiHealth: "/api/health",
} as const;

/** クローラー・監視が未認証で読む必要のある生成ファイル */
export const PUBLIC_METADATA_PATHS: readonly string[] = [
  "/robots.txt",
  "/sitemap.xml",
];

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** OAuth ログイン成功後の既定遷移先（Social / signIn の callbackUrl と一致させる） */
export const DEFAULT_LOGIN_REDIRECT = ROUTES.subscriptions;

/** Auth.js signIn コールバックでクエリに載せるエラー値（login/page の ERROR_MESSAGES と一致） */
export const AUTH_ERROR_QUERY = {
  OAuthAccountNotLinked: "OAuthAccountNotLinked",
  /** ログイン中に別 OAuth を紐づけようとした */
  OAuthWhileSignedIn: "OAuthWhileSignedIn",
  /** デモアカウントでは OAuth 不可 */
  OAuthDemoForbidden: "OAuthDemoForbidden",
  EmailNotVerified: "EmailNotVerified",
} as const;

/** メール確認完了後にログインページへ表示するクエリ */
export const LOGIN_VERIFIED_QUERY = "verified";

export function loginUrlWithSearchParams(
  params: Record<string, string | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value);
  }
  const q = search.toString();
  return q ? `${ROUTES.login}?${q}` : ROUTES.login;
}

/** proxy で認証スキップするパス（旧実装と同一の集合） */
export const PROXY_PUBLIC_PATH_PREFIXES: readonly string[] = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.verifyEmail,
  ROUTES.resendVerification,
  ROUTES.resetPassword,
  ROUTES.mfaVerify,
  ROUTES.apiAuth,
  ROUTES.apiCron,
  ROUTES.apiHealth,
  ...PUBLIC_METADATA_PATHS,
];

/** `_next`・favicon 等。proxy の `config.matcher` は Next.js の静的解析要件のため `src/proxy.ts` に同一除外パターンをリテラルで記述する */
export const PROXY_IGNORED_PATH_PREFIXES: readonly string[] = [
  "/_next",
  "/assets",
  "/favicon.ico",
];
