/** login 窓: 15 分 */
export const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

/** login: 同一メールあたり上限 */
export const LOGIN_RATE_LIMIT_PER_EMAIL = 10;

/** login: 同一 IP あたり上限 */
export const LOGIN_RATE_LIMIT_PER_IP = 30;

/** デモオートログイン窓: 15 分（通常 login と同じ） */
export const DEMO_LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

/** デモオートログイン: 同一メールあたり上限（共有デモ向けに緩め） */
export const DEMO_LOGIN_RATE_LIMIT_PER_EMAIL = 60;

/** デモオートログイン: 同一 IP あたり上限 */
export const DEMO_LOGIN_RATE_LIMIT_PER_IP = 60;

/** forgot-password 窓: 1 時間 */
export const FORGOT_RATE_WINDOW_MS = 60 * 60 * 1000;

/** forgot: 同一メールあたり上限 */
export const FORGOT_RATE_LIMIT_PER_EMAIL = 5;

/** forgot: 同一 IP あたり上限 */
export const FORGOT_RATE_LIMIT_PER_IP = 10;

/** Dokploy で false にすると制限を無効化（作業前相当） */
export const AUTH_RATE_LIMIT_ENV_KEY = "AUTH_RATE_LIMIT_ENABLED";

export const LOGIN_RATE_LIMIT_MESSAGE =
  "試行回数が上限に達しました。しばらくしてから再度お試しください。";
