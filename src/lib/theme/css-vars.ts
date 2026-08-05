import type { CSSProperties } from "react";
import {
  getColorTheme,
  themeBackgroundCss,
  themeToCssVariables,
  type ColorTheme,
} from "@/lib/theme/themes";

export function colorThemeToStyle(
  themeOrId: ColorTheme | string
): CSSProperties {
  const theme =
    typeof themeOrId === "string" ? getColorTheme(themeOrId) : themeOrId;

  return {
    ...themeToCssVariables(theme),
    background: themeBackgroundCss(theme),
    color: theme.foreground,
  } as CSSProperties;
}

/**
 * サイドバー等は選択テーマの変数を維持しつつ、
 * ページ背景・前景だけデフォルトに固定する（アカウント／各種設定用）。
 */
export function colorThemeToChromeLockedStyle(
  selectedThemeOrId: ColorTheme | string
): CSSProperties {
  const selected =
    typeof selectedThemeOrId === "string"
      ? getColorTheme(selectedThemeOrId)
      : selectedThemeOrId;
  const defaults = getColorTheme("default");

  return {
    ...themeToCssVariables(selected),
    "--app-fg": defaults.foreground,
    background: themeBackgroundCss(defaults),
    color: defaults.foreground,
  } as CSSProperties;
}
