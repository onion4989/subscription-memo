/**
 * アプリ内パスの単一情報源（Link / redirect / proxy / Auth.js と整合させる）
 */

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  /** ユーザー情報・ニックネーム編集（ページは未実装。認証必須パス） */
  profile: "/profile",
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
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** OAuth ログイン成功後の既定遷移先（Social / signIn の callbackUrl と一致させる） */
export const DEFAULT_LOGIN_REDIRECT = ROUTES.subscriptions;

/** Auth.js signIn コールバックでクエリに載せるエラー値（login/page の ERROR_MESSAGES と一致） */
export const AUTH_ERROR_QUERY = {
  OAuthAccountNotLinked: "OAuthAccountNotLinked",
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
];

/** `_next`・favicon 等。proxy の `config.matcher` は Next.js の静的解析要件のため `src/proxy.ts` に同一除外パターンをリテラルで記述する */
export const PROXY_IGNORED_PATH_PREFIXES: readonly string[] = [
  "/_next",
  "/assets",
  "/favicon.ico",
];
