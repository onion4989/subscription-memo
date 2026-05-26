/**
 * アプリ内パスの単一情報源（Link / redirect / proxy / Auth.js と整合させる）
 */

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  /** ユーザー情報・ニックネーム編集（ページは未実装。認証必須パス） */
  profile: "/profile",
  success: "/success",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  mfaSetup: "/mfa/setup",
  mfaVerify: "/mfa/verify",
  apiAuth: "/api/auth",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** OAuth ログイン成功後の既定遷移先（Social / signIn の callbackUrl と一致させる） */
export const DEFAULT_LOGIN_REDIRECT = ROUTES.success;

/** Auth.js signIn コールバックでクエリに載せるエラー値（login/page の ERROR_MESSAGES と一致） */
export const AUTH_ERROR_QUERY = {
  OAuthAccountNotLinked: "OAuthAccountNotLinked",
} as const;

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
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.mfaVerify,
  ROUTES.apiAuth,
];

/** `_next`・favicon 等。proxy の `config.matcher` は Next.js の静的解析要件のため `src/proxy.ts` に同一除外パターンをリテラルで記述する */
export const PROXY_IGNORED_PATH_PREFIXES: readonly string[] = [
  "/_next",
  "/favicon.ico",
];
