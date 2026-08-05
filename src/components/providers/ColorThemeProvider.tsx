"use client";

import {
  createContext,
  use,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { updateColorTheme } from "@/lib/actions/update-color-theme";
import {
  colorThemeToChromeLockedStyle,
  colorThemeToStyle,
} from "@/lib/theme/css-vars";
import { ROUTES } from "@/lib/routes";
import {
  getColorTheme,
  resolveColorThemeId,
  type ColorTheme,
  type ColorThemeId,
} from "@/lib/theme/themes";

type ColorThemeContextValue = {
  themeId: ColorThemeId;
  theme: ColorTheme;
  isPending: boolean;
  /** アカウント／各種設定ではページ背景をデフォルト固定 */
  isChromeThemeLocked: boolean;
  setThemeId: (themeId: ColorThemeId) => void;
};

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

const CHROME_THEME_LOCKED_PATHS = new Set<string>([
  ROUTES.account,
  ROUTES.settings,
]);

type ColorThemeProviderProps = {
  initialThemeId: string;
  children: ReactNode;
  className?: string;
};

export function ColorThemeProvider({
  initialThemeId,
  children,
  className,
}: ColorThemeProviderProps) {
  const pathname = usePathname();
  const isChromeThemeLocked = CHROME_THEME_LOCKED_PATHS.has(pathname);

  const resolvedInitial = resolveColorThemeId(initialThemeId);
  const [optimisticThemeId, setOptimisticThemeId] =
    useOptimistic<ColorThemeId>(resolvedInitial);
  const [isPending, startTransition] = useTransition();

  const themeId = optimisticThemeId;
  const theme = getColorTheme(themeId);

  const setThemeId = (nextThemeId: ColorThemeId) => {
    if (nextThemeId === themeId) {
      return;
    }

    startTransition(async () => {
      setOptimisticThemeId(nextThemeId);
      await updateColorTheme(nextThemeId);
    });
  };

  const style = isChromeThemeLocked
    ? colorThemeToChromeLockedStyle(theme)
    : colorThemeToStyle(theme);

  return (
    <ColorThemeContext.Provider
      value={{
        themeId,
        theme,
        isPending,
        isChromeThemeLocked,
        setThemeId,
      }}
    >
      <div data-app-theme={themeId} className={className} style={style}>
        {children}
      </div>
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme(): ColorThemeContextValue {
  const value = use(ColorThemeContext);
  if (!value) {
    throw new Error("useColorTheme must be used within ColorThemeProvider");
  }
  return value;
}
