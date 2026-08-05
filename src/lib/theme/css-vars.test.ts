import { describe, expect, it } from "vitest";
import {
  colorThemeToChromeLockedStyle,
  colorThemeToStyle,
} from "@/lib/theme/css-vars";
import { COLOR_THEMES, themeBackgroundCss } from "@/lib/theme/themes";

describe("colorTheme chrome lock", () => {
  it("keeps selected sidebar tokens while forcing default background", () => {
    const locked = colorThemeToChromeLockedStyle("midnight") as Record<
      string,
      string
    >;
    const midnight = colorThemeToStyle("midnight");
    const defaults = COLOR_THEMES.default;

    expect(locked.background).toBe(themeBackgroundCss(defaults));
    expect(locked.color).toBe(defaults.foreground);
    expect(locked["--app-fg"]).toBe(defaults.foreground);
    expect(locked["--app-sidebar-bg"]).toBe(COLOR_THEMES.midnight.sidebarBg);
    expect(locked["--app-sidebar-bg"]).toBe("#24283B");
    expect(locked.background).not.toBe(midnight.background);
  });
});
