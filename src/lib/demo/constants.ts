/**
 * 公開デモ用アカウントの定数。
 * README に載せる認証情報と一致させる。通常ユーザーのロジックには影響しない。
 */
export const DEMO_USER_EMAIL = "demo@example.com";

/** README / シード / 日次リセットで使うデモ専用パスワード（8 文字以上） */
export const DEMO_USER_PASSWORD = "demo1234";

export const DEMO_USER_DISPLAY_NAME = "デモ";

/** デモ判定。email が無い場合は false（既存ユーザーに影響しない） */
export function isDemoUserEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return email.trim().toLowerCase() === DEMO_USER_EMAIL;
}

export const DEMO_ACCOUNT_GUARD_MESSAGE =
  "デモアカウントではこの操作はご利用いただけません。";
