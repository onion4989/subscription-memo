import {
  COLOR_THEMES,
  type RgbColor,
} from "@/lib/theme/themes";

function lerpChannel(start: number, end: number, t: number): number {
  return Math.round(start + (end - start) * t);
}

/** 列数に応じて start→end を補間したヘッダー背景色 */
export function subscriptionHeaderColor(
  index: number,
  count: number,
  start: RgbColor = COLOR_THEMES.default.tableHeaderStart,
  end: RgbColor = COLOR_THEMES.default.tableHeaderEnd
): string {
  const t = count <= 1 ? 0 : index / (count - 1);
  const r = lerpChannel(start.r, end.r, t);
  const g = lerpChannel(start.g, end.g, t);
  const b = lerpChannel(start.b, end.b, t);
  return `rgb(${r}, ${g}, ${b})`;
}
