/**
 * ログイン後アプリ（`(app)`）専用のカラーテーマ定義。
 * 認証前画面には適用しない。
 *
 * 方針:
 * - テーブル枠は全テーマ黒寄り統一（視認性優先）
 * - ラベル行はグレー系
 * - 個性はページ背景・サマリー・ボタン・サイドバー面に出す
 */

export const DEFAULT_THEME_ID = "default" as const;

export const COLOR_THEME_IDS = [
  "default",
  "ocean",
  "sunset",
  "forest",
  "cyberpunk",
  "sakura",
  "coffee",
  "nordic",
  "midnight",
  "citrus",
  "vintage",
] as const;

export type ColorThemeId = (typeof COLOR_THEME_IDS)[number];

export type RgbColor = { r: number; g: number; b: number };

export type ThemeBackground =
  | { type: "gradient"; from: string; to: string }
  | { type: "solid"; color: string };

/** ライト系テーマのテーブル／お知らせ枠（黒寄り統一） */
export const TABLE_FRAME_NEAR_BLACK = "#111827";

/** ダーク系テーマのテーブル枠（ページ背景より一段暗い） */
export const TABLE_FRAME_DARK = "#020617";

const TABLE_LABEL_EVEN = "#9CA3AF";
const TABLE_LABEL_ODD = "#D1D5DB";

const SIDEBAR_LIGHT = {
  sidebarBg: "#FFFFFF",
  sidebarFg: "#0F172A",
  sidebarMutedFg: "#334155",
  sidebarHover: "#E2E8F0",
  sidebarActive: "#CBD5E1",
  sidebarTooltipBg: "#CBD5E1",
  sidebarTooltipFg: "#0F172A",
} as const;

const SIDEBAR_DARK = {
  sidebarBg: "#1E293B",
  sidebarFg: "#E2E8F0",
  sidebarMutedFg: "#94A3B8",
  sidebarHover: "#334155",
  sidebarActive: "#475569",
  sidebarTooltipBg: "#334155",
  sidebarTooltipFg: "#F8FAFC",
} as const;

export type ColorTheme = {
  id: ColorThemeId;
  label: string;
  background: ThemeBackground;
  foreground: string;
  summary: [string, string, string];
  summaryForeground: [string, string, string];
  tagUrgent: string;
  tagSoon: string;
  tagUrgentForeground: string;
  tagSoonForeground: string;
  noticeIconUrgent: string;
  noticeIconSoon: string;
  actionPrimary: string;
  actionPrimaryHover: string;
  actionDanger: string;
  actionDangerHover: string;
  tableFrame: string;
  tableLabelEven: string;
  tableLabelOdd: string;
  tableHeaderStart: RgbColor;
  tableHeaderEnd: RgbColor;
  sidebarBg: string;
  sidebarFg: string;
  sidebarMutedFg: string;
  sidebarHover: string;
  sidebarActive: string;
  sidebarTooltipBg: string;
  sidebarTooltipFg: string;
};

function parseHex(hex: string): RgbColor {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => `${ch}${ch}`)
          .join("")
      : normalized;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

/** 背景に対して読みやすい前景色（白 or ほぼ黒） */
export function contrastForeground(backgroundHex: string): string {
  const { r, g, b } = parseHex(backgroundHex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111111" : "#FFFFFF";
}

function hexToRgb(hex: string): RgbColor {
  return parseHex(hex);
}

function createTheme(
  partial: Omit<ColorTheme, "summaryForeground"> & {
    summaryForeground?: [string, string, string];
  }
): ColorTheme {
  return {
    ...partial,
    summaryForeground:
      partial.summaryForeground ??
      ([
        contrastForeground(partial.summary[0]),
        contrastForeground(partial.summary[1]),
        contrastForeground(partial.summary[2]),
      ] as [string, string, string]),
  };
}

export const COLOR_THEMES: Record<ColorThemeId, ColorTheme> = {
  default: createTheme({
    id: "default",
    label: "デフォルト",
    background: { type: "gradient", from: "#000000", to: "#06648F" },
    foreground: "#FFFFFF",
    summary: ["#768A20", "#208A73", "#8A2082"],
    tagUrgent: "#9F193B",
    tagSoon: "#EDE466",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#000000",
    noticeIconUrgent: "#E62F5D",
    noticeIconSoon: "#EDE466",
    actionPrimary: "#8A2082",
    actionPrimaryHover: "#74206E",
    actionDanger: "#9B1343",
    actionDangerHover: "#851039",
    tableFrame: "#000000",
    tableLabelEven: "#A3A3A3",
    tableLabelOdd: "#C9C9C9",
    tableHeaderStart: { r: 249, g: 203, b: 142 },
    tableHeaderEnd: { r: 162, g: 240, b: 235 },
    ...SIDEBAR_LIGHT,
  }),
  ocean: createTheme({
    id: "ocean",
    label: "オーシャン",
    background: { type: "solid", color: "#E8F4FC" },
    foreground: "#0B3D5C",
    summary: ["#0077B6", "#0096C7", "#00B4D8"],
    tagUrgent: "#C1121F",
    tagSoon: "#EAB308",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#C1121F",
    noticeIconSoon: "#EAB308",
    actionPrimary: "#0077B6",
    actionPrimaryHover: "#023E8A",
    actionDanger: "#C1121F",
    actionDangerHover: "#9B0E18",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#48CAE4"),
    tableHeaderEnd: hexToRgb("#0077B6"),
    ...SIDEBAR_LIGHT,
  }),
  sunset: createTheme({
    id: "sunset",
    label: "サンセット",
    background: { type: "solid", color: "#FFF1F0" },
    foreground: "#5C1A1A",
    summary: ["#E63946", "#F4A261", "#E9C46A"],
    tagUrgent: "#E63946",
    tagSoon: "#EAB308",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#E63946",
    noticeIconSoon: "#EAB308",
    actionPrimary: "#E63946",
    actionPrimaryHover: "#C1121F",
    actionDanger: "#9B2226",
    actionDangerHover: "#7A1A1D",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#F4A261"),
    tableHeaderEnd: hexToRgb("#E63946"),
    ...SIDEBAR_LIGHT,
  }),
  forest: createTheme({
    id: "forest",
    label: "フォレスト",
    background: { type: "solid", color: "#EEF5F0" },
    foreground: "#1B4332",
    summary: ["#2D6A4F", "#40916C", "#52B788"],
    tagUrgent: "#9B2226",
    tagSoon: "#EAB308",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#9B2226",
    noticeIconSoon: "#EAB308",
    actionPrimary: "#2D6A4F",
    actionPrimaryHover: "#1B4332",
    actionDanger: "#9B2226",
    actionDangerHover: "#7A1A1D",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#95D5B2"),
    tableHeaderEnd: hexToRgb("#2D6A4F"),
    ...SIDEBAR_LIGHT,
  }),
  cyberpunk: createTheme({
    id: "cyberpunk",
    label: "サイバーパンク",
    background: { type: "solid", color: "#0F172A" },
    foreground: "#E2E8F0",
    summary: ["#F43F5E", "#8B5CF6", "#06B6D4"],
    tagUrgent: "#F43F5E",
    tagSoon: "#FDE047",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#F43F5E",
    noticeIconSoon: "#FDE047",
    actionPrimary: "#8B5CF6",
    actionPrimaryHover: "#7C3AED",
    actionDanger: "#F43F5E",
    actionDangerHover: "#E11D48",
    tableFrame: TABLE_FRAME_DARK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#8B5CF6"),
    tableHeaderEnd: hexToRgb("#06B6D4"),
    ...SIDEBAR_DARK,
  }),
  sakura: createTheme({
    id: "sakura",
    label: "サクラ",
    background: { type: "solid", color: "#FDF2F8" },
    foreground: "#831843",
    summary: ["#DB2777", "#EC4899", "#F472B6"],
    tagUrgent: "#BE123C",
    tagSoon: "#EAB308",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#BE123C",
    noticeIconSoon: "#EAB308",
    actionPrimary: "#DB2777",
    actionPrimaryHover: "#BE185D",
    actionDanger: "#BE123C",
    actionDangerHover: "#9F1239",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#F9A8D4"),
    tableHeaderEnd: hexToRgb("#DB2777"),
    ...SIDEBAR_LIGHT,
  }),
  coffee: createTheme({
    id: "coffee",
    label: "コーヒー",
    background: { type: "solid", color: "#F5EFE6" },
    foreground: "#3E2723",
    summary: ["#4A3B32", "#8C6D58", "#A67C5D"],
    tagUrgent: "#7F1D1D",
    tagSoon: "#EAB308",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#7F1D1D",
    noticeIconSoon: "#EAB308",
    actionPrimary: "#8C6D58",
    actionPrimaryHover: "#6F5646",
    actionDanger: "#7F1D1D",
    actionDangerHover: "#641616",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#C0A080"),
    tableHeaderEnd: hexToRgb("#4A3B32"),
    ...SIDEBAR_LIGHT,
  }),
  nordic: createTheme({
    id: "nordic",
    label: "ノーディック",
    background: { type: "solid", color: "#E8EEF4" },
    foreground: "#1E293B",
    summary: ["#334155", "#475569", "#64748B"],
    tagUrgent: "#B91C1C",
    tagSoon: "#EAB308",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#B91C1C",
    noticeIconSoon: "#EAB308",
    actionPrimary: "#475569",
    actionPrimaryHover: "#334155",
    actionDanger: "#B91C1C",
    actionDangerHover: "#991B1B",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#94A3B8"),
    tableHeaderEnd: hexToRgb("#334155"),
    ...SIDEBAR_LIGHT,
  }),
  midnight: createTheme({
    id: "midnight",
    label: "ミッドナイト",
    background: { type: "solid", color: "#1A1B26" },
    foreground: "#C0CAF5",
    summary: ["#7AA2F7", "#BB9AF7", "#7DCFFF"],
    tagUrgent: "#F7768E",
    tagSoon: "#E0AF68",
    tagUrgentForeground: "#1A1B26",
    tagSoonForeground: "#1A1B26",
    noticeIconUrgent: "#F7768E",
    noticeIconSoon: "#E0AF68",
    actionPrimary: "#7AA2F7",
    actionPrimaryHover: "#5D8AE8",
    actionDanger: "#F7768E",
    actionDangerHover: "#E05C78",
    tableFrame: "#0B0D14",
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#7AA2F7"),
    tableHeaderEnd: hexToRgb("#BB9AF7"),
    sidebarBg: "#24283B",
    sidebarFg: "#C0CAF5",
    sidebarMutedFg: "#A9B1D6",
    sidebarHover: "#414868",
    sidebarActive: "#565F89",
    sidebarTooltipBg: "#414868",
    sidebarTooltipFg: "#C0CAF5",
  }),
  citrus: createTheme({
    id: "citrus",
    label: "シトラス",
    background: { type: "solid", color: "#FEF9C3" },
    foreground: "#365314",
    summary: ["#CA8A04", "#65A30D", "#16A34A"],
    tagUrgent: "#DC2626",
    tagSoon: "#EAB308",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#DC2626",
    noticeIconSoon: "#EAB308",
    actionPrimary: "#65A30D",
    actionPrimaryHover: "#4D7C0F",
    actionDanger: "#DC2626",
    actionDangerHover: "#B91C1C",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#EAB308"),
    tableHeaderEnd: hexToRgb("#16A34A"),
    ...SIDEBAR_LIGHT,
  }),
  vintage: createTheme({
    id: "vintage",
    label: "ヴィンテージ",
    background: { type: "solid", color: "#F5ECD7" },
    foreground: "#3F2A1D",
    summary: ["#991B1B", "#854D0E", "#166534"],
    tagUrgent: "#991B1B",
    tagSoon: "#CA8A04",
    tagUrgentForeground: "#FFFFFF",
    tagSoonForeground: "#111111",
    noticeIconUrgent: "#991B1B",
    noticeIconSoon: "#CA8A04",
    actionPrimary: "#854D0E",
    actionPrimaryHover: "#713F12",
    actionDanger: "#991B1B",
    actionDangerHover: "#7F1D1D",
    tableFrame: TABLE_FRAME_NEAR_BLACK,
    tableLabelEven: TABLE_LABEL_EVEN,
    tableLabelOdd: TABLE_LABEL_ODD,
    tableHeaderStart: hexToRgb("#CA8A04"),
    tableHeaderEnd: hexToRgb("#166534"),
    ...SIDEBAR_LIGHT,
  }),
};

export const COLOR_THEME_LIST: ColorTheme[] = COLOR_THEME_IDS.map(
  (id) => COLOR_THEMES[id]
);

export function isColorThemeId(value: string): value is ColorThemeId {
  return (COLOR_THEME_IDS as readonly string[]).includes(value);
}

export function resolveColorThemeId(
  value: string | null | undefined
): ColorThemeId {
  if (value && isColorThemeId(value)) {
    return value;
  }
  return DEFAULT_THEME_ID;
}

export function getColorTheme(
  value: string | null | undefined
): ColorTheme {
  return COLOR_THEMES[resolveColorThemeId(value)];
}

/** スイッチャー用プレビュー（背景 + サマリー3色） */
export function getThemePreviewColors(theme: ColorTheme): [string, string, string, string] {
  const background =
    theme.background.type === "gradient"
      ? theme.background.from
      : theme.background.color;
  return [background, theme.summary[0], theme.summary[1], theme.summary[2]];
}

export function themeBackgroundCss(theme: ColorTheme): string {
  if (theme.background.type === "gradient") {
    return `linear-gradient(to bottom, ${theme.background.from}, ${theme.background.to})`;
  }
  return theme.background.color;
}

/** `(app)` ルートに載せる CSS 変数 */
export function themeToCssVariables(
  theme: ColorTheme
): Record<string, string> {
  return {
    "--app-fg": theme.foreground,
    "--app-summary-1": theme.summary[0],
    "--app-summary-2": theme.summary[1],
    "--app-summary-3": theme.summary[2],
    "--app-summary-fg-1": theme.summaryForeground[0],
    "--app-summary-fg-2": theme.summaryForeground[1],
    "--app-summary-fg-3": theme.summaryForeground[2],
    "--app-tag-urgent": theme.tagUrgent,
    "--app-tag-soon": theme.tagSoon,
    "--app-tag-urgent-fg": theme.tagUrgentForeground,
    "--app-tag-soon-fg": theme.tagSoonForeground,
    "--app-notice-icon-urgent": theme.noticeIconUrgent,
    "--app-notice-icon-soon": theme.noticeIconSoon,
    "--app-action-primary": theme.actionPrimary,
    "--app-action-primary-hover": theme.actionPrimaryHover,
    "--app-action-danger": theme.actionDanger,
    "--app-action-danger-hover": theme.actionDangerHover,
    "--app-table-frame": theme.tableFrame,
    "--app-table-label-even": theme.tableLabelEven,
    "--app-table-label-odd": theme.tableLabelOdd,
    "--app-sidebar-bg": theme.sidebarBg,
    "--app-sidebar-fg": theme.sidebarFg,
    "--app-sidebar-muted-fg": theme.sidebarMutedFg,
    "--app-sidebar-hover": theme.sidebarHover,
    "--app-sidebar-active": theme.sidebarActive,
    "--app-sidebar-tooltip-bg": theme.sidebarTooltipBg,
    "--app-sidebar-tooltip-fg": theme.sidebarTooltipFg,
  };
}
