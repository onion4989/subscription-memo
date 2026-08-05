import { describe, expect, it } from "vitest";
import {
  COLOR_THEME_IDS,
  COLOR_THEMES,
  DEFAULT_THEME_ID,
  getThemePreviewColors,
  isColorThemeId,
  resolveColorThemeId,
  TABLE_FRAME_DARK,
  TABLE_FRAME_NEAR_BLACK,
} from "@/lib/theme/themes";

describe("color themes", () => {
  it("includes default and ten preset themes", () => {
    expect(COLOR_THEME_IDS).toHaveLength(11);
    expect(COLOR_THEME_IDS[0]).toBe(DEFAULT_THEME_ID);
    expect(COLOR_THEMES.midnight.background).toEqual({
      type: "solid",
      color: "#1A1B26",
    });
    expect(COLOR_THEMES.midnight.summary).toEqual([
      "#7AA2F7",
      "#BB9AF7",
      "#7DCFFF",
    ]);
  });

  it("resolves unknown ids to default", () => {
    expect(isColorThemeId("ocean")).toBe(true);
    expect(isColorThemeId("nope")).toBe(false);
    expect(resolveColorThemeId("nope")).toBe("default");
  });

  it("builds four preview colors", () => {
    expect(getThemePreviewColors(COLOR_THEMES.default)).toEqual([
      "#000000",
      "#768A20",
      "#208A73",
      "#8A2082",
    ]);
  });

  it("unifies table frames near-black and uses gray label rows outside default", () => {
    expect(COLOR_THEMES.ocean.tableFrame).toBe(TABLE_FRAME_NEAR_BLACK);
    expect(COLOR_THEMES.sakura.tableFrame).toBe(TABLE_FRAME_NEAR_BLACK);
    expect(COLOR_THEMES.citrus.tableFrame).toBe(TABLE_FRAME_NEAR_BLACK);
    expect(COLOR_THEMES.cyberpunk.tableFrame).toBe(TABLE_FRAME_DARK);
    expect(COLOR_THEMES.ocean.tableLabelEven).toBe("#9CA3AF");
    expect(COLOR_THEMES.ocean.tableLabelOdd).toBe("#D1D5DB");
    expect(COLOR_THEMES.ocean.summary[2]).toBe("#00B4D8");
    expect(COLOR_THEMES.nordic.tagSoon).toBe("#EAB308");
  });

  it("exposes sidebar surface tokens", () => {
    expect(COLOR_THEMES.ocean.sidebarBg).toBe("#FFFFFF");
    expect(COLOR_THEMES.midnight.sidebarBg).toBe("#24283B");
    expect(COLOR_THEMES.cyberpunk.sidebarFg).toBe("#E2E8F0");
  });
});
