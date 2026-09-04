import {
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM,
} from "@/lib/subscription/subscription-table-layout";

/**
 * scrollLeft を列幅の倍数、または末尾（maxScrollLeft）のうち近い方へ丸める。
 * 末尾を候補に含め、最後の列が途中で切れたまま戻されるのを防ぐ。
 */
export function snapScrollLeftToColumn(
  scrollLeft: number,
  columnWidthPx: number,
  maxScrollLeft: number
): number {
  if (columnWidthPx <= 0) {
    return scrollLeft;
  }
  const maxLeft = Math.max(0, maxScrollLeft);
  if (maxLeft === 0) {
    return 0;
  }

  const candidates: number[] = [];
  const stepCount = Math.floor(maxLeft / columnWidthPx);
  for (let step = 0; step <= stepCount; step += 1) {
    candidates.push(step * columnWidthPx);
  }
  const lastMultiple = candidates[candidates.length - 1];
  if (
    lastMultiple === undefined ||
    Math.abs(lastMultiple - maxLeft) > 0.5
  ) {
    candidates.push(maxLeft);
  }

  let best = candidates[0] ?? 0;
  let bestDist = Math.abs(scrollLeft - best);
  for (const candidate of candidates) {
    const dist = Math.abs(scrollLeft - candidate);
    // 半端は大きい方へ（Math.round と同じ）
    if (dist < bestDist || (dist === bestDist && candidate > best)) {
      best = candidate;
      bestDist = dist;
    }
  }
  return best;
}

/** ルート font-size から列幅 px を算出（DOM 計測できないときのフォールバック） */
export function getSubTableColumnWidthPx(
  rootFontSizePx = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize
  )
): number {
  if (!Number.isFinite(rootFontSizePx) || rootFontSizePx <= 0) {
    return SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM * 16;
  }
  return SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM * rootFontSizePx;
}

/** 先頭データ列（thead 2 列目）の実幅。整数 px を優先 */
export function measureSubTableColumnWidthPx(area: HTMLElement): number {
  const dataHeader = area.querySelector("thead th:nth-child(2)");
  if (dataHeader instanceof HTMLElement) {
    const width = dataHeader.offsetWidth;
    if (width > 0) {
      return width;
    }
  }
  return getSubTableColumnWidthPx();
}

/**
 * maxScrollLeft を列幅の倍数に近づける末尾 padding。
 * 既にほぼ倍数なら 0。
 * ※枠線用 gutter はテーブル幅側のみに足し、ここでは足さない
 * （末尾の余分スクロールで sticky 見出しがズレるのを防ぐ）。
 */
export function getSnapEndPaddingPx(
  maxScrollLeft: number,
  columnWidthPx: number
): number {
  if (columnWidthPx <= 0 || maxScrollLeft <= 0) {
    return 0;
  }
  const remainder = maxScrollLeft % columnWidthPx;
  if (remainder < 0.5 || columnWidthPx - remainder < 0.5) {
    return 0;
  }
  return columnWidthPx - remainder;
}

/**
 * スクロール末尾 padding（吸着揃えのみ。gutter は含めない）。
 */
export function getContentEndPaddingPx(
  maxScrollLeft: number,
  columnWidthPx: number
): number {
  return getSnapEndPaddingPx(maxScrollLeft, columnWidthPx);
}
