import type { Locator } from "@playwright/test";

/**
 * 枠の背景色は利用者のテーマ（`--app-table-frame`）で変わるため、
 * 期待値を固定せずページ上の実効値から求める。
 * 変数は `(app)` レイアウトのルートに載るので、その内側にある要素を起点に解決する。
 * 空の要素へ変数を適用して読むことで、`toHaveCSS` と同じ `rgb(r, g, b)` 表記で得られる。
 */
export async function resolveThemeFrameColor(anchor: Locator): Promise<string> {
  return anchor.evaluate((node) => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--app-table-frame)";
    node.appendChild(probe);
    const color = window.getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
}
