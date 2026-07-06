/**
 * 認証系フルページの outer `main`。ログインページを基準に margin / padding を統一する。
 *
 * - モバイル: 上寄せ + 上下余白（safe-area 加算）。長いフォームは body ごとスクロールする。
 * - sm 以上: 縦中央寄せを維持する。
 * - padding は `calc(2rem + env(..., 0px))` で iOS Safari でも確実に効かせる。
 */
export const AUTH_PAGE_MAIN_CLASS =
  "flex w-full min-h-dvh flex-col items-center bg-linear-to-b from-[#000000] to-[#06648F] px-4 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:justify-center sm:pt-[calc(3rem+env(safe-area-inset-top,0px))] sm:pb-[calc(3rem+env(safe-area-inset-bottom,0px))]" as const;

/**
 * `main` 直下でカード・アラートなど複数要素を一塊にまとめるラッパー。
 * `AUTH_CARD_MAX_WIDTH_CLASS` と併用する。
 */
export const AUTH_PAGE_CONTENT_CLASS = "flex w-full flex-col" as const;

/**
 * `CardWrapper` の `Card` と同じ最大幅。`Card` を直接使う画面（MFA 等）と揃える。
 */
export const AUTH_CARD_MAX_WIDTH_CLASS = "w-full max-w-[360px]" as const;
