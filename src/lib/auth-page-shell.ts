/**
 * 認証系フルページの outer `main`。ログインページを基準に margin / padding を統一する。
 */
export const AUTH_PAGE_MAIN_CLASS =
  "flex min-h-screen flex-col items-center justify-center px-4" as const;

/**
 * `CardWrapper` の `Card` と同じ最大幅。`Card` を直接使う画面（MFA 等）と揃える。
 */
export const AUTH_CARD_MAX_WIDTH_CLASS = "w-full max-w-[360px]" as const;
