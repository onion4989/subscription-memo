import { expect, test, type Page } from "@playwright/test";

/** 確認サイズは `_knowledge/10-standards/viewport-check.md` の 3 種に合わせる */
const VIEWPORTS = [
  { label: "mobile 390x844", width: 390, height: 844 },
  { label: "tablet 768x1024", width: 768, height: 1024 },
  { label: "desktop 1440x800", width: 1440, height: 800 },
] as const;

const PUBLIC_PATHS = ["/", "/login", "/signup"] as const;

const APP_PATHS = [
  "/subscriptions",
  "/subscriptions/new",
  "/subscriptions/manage",
  "/settings",
  "/account",
  "/guide",
] as const;

/**
 * 到達確認は見出しではなく pathname で行う。
 * 未ログインで弾かれた場合に `/login` へ飛ぶため、それを取りこぼさない。
 */
async function gotoAndExpectPath(page: Page, path: string): Promise<void> {
  await page.goto(path);
  const actual = new URL(page.url()).pathname;
  expect(actual, `expected to stay on ${path}`).toBe(path);
}

async function expectNoHorizontalOverflow(
  page: Page,
  path: string,
  label: string
): Promise<void> {
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));

  expect(
    size.scroll,
    `${path} は ${label} で横にはみ出している（${size.scroll} > ${size.client}）`
  ).toBeLessThanOrEqual(size.client);
}

/**
 * 1 つの page を使い回してサイズだけ変える。
 * spec を 3 サイズ分に増やすとログイン回数もレートリミットも 3 倍になるため。
 * 登録・削除は行わない（既存ヘルパーがデスクトップの表構造を前提にしているため）。
 */
test.describe("P1-V viewport (public)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("V1: 未ログインのページが標準 3 サイズで横あふれしない", async ({
    page,
  }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const path of PUBLIC_PATHS) {
        await gotoAndExpectPath(page, path);
        await expectNoHorizontalOverflow(page, path, viewport.label);
      }
    }
  });
});

test.describe("P1-V viewport (app)", () => {
  test("V2: ログイン後のページが標準 3 サイズで横あふれしない", async ({
    page,
  }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const path of APP_PATHS) {
        await gotoAndExpectPath(page, path);
        await expectNoHorizontalOverflow(page, path, viewport.label);
      }
    }
  });
});
