const APP_SCROLLBAR_BASE_CLASS = "app-scrollbar";

/** 横スクロール領域（グラデーション背景向け・統一スクロールバー） */
export const APP_SCROLLBAR_X_CLASS = `${APP_SCROLLBAR_BASE_CLASS} w-full min-w-0 overflow-x-auto pb-[var(--app-scrollbar-gap)]`;

/** 縦スクロール領域（グラデーション背景向け・統一スクロールバー） */
export const APP_SCROLLBAR_Y_CLASS = `${APP_SCROLLBAR_BASE_CLASS} overflow-y-auto pr-[var(--app-scrollbar-gap)]`;

/** 白背景向けのスクロールバー色 */
export const APP_SCROLLBAR_ON_LIGHT_CLASS = "app-scrollbar-on-light";
