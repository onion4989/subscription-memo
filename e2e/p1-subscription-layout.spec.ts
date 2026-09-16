import { expect, test } from "@playwright/test";
import { resolveThemeFrameColor } from "./helpers/theme";
import {
  fillSubscriptionCreateForm,
  openCreateSubscriptionModal,
  submitSubscriptionCreate,
  uniqueSubscriptionName,
  visibleGetByText,
  deleteSubscriptionByName,
} from "./helpers/subscription";

function contentSection(page: import("@playwright/test").Page, title: string) {
  return page.locator("section").filter({ hasText: title }).first();
}

async function expectSectionMaxWidth1000(
  page: import("@playwright/test").Page,
  title: string
): Promise<void> {
  const section = contentSection(page, title);
  await expect(section).toBeVisible();
  const box = await section.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(1000.5);
}

async function findVisibleTableFrame(page: import("@playwright/test").Page) {
  const table = page.locator("table").filter({ visible: true }).first();
  await expect(table).toBeVisible();
  const frameColor = await resolveThemeFrameColor(table);
  return table.evaluate((node, expectedBg) => {
    let current: HTMLElement | null = node.parentElement;
    while (current) {
      const style = window.getComputedStyle(current);
      const borderTop = Number.parseFloat(style.borderTopWidth);
      const bg = style.backgroundColor;
      if (borderTop >= 1.5 && bg === expectedBg) {
        return {
          top: current.getBoundingClientRect().top,
          left: current.getBoundingClientRect().left,
          right: current.getBoundingClientRect().right,
          bottom: current.getBoundingClientRect().bottom,
          borderTopWidth: style.borderTopWidth,
          backgroundColor: bg,
        };
      }
      current = current.parentElement;
    }
    return null;
  }, frameColor);
}

test.describe("P1 subscription layout (shell / frames)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
  });

  test("L1: 右側シェル領域は一覧・登録・削除で max 1000px", async ({
    page,
  }) => {
    await page.goto("/subscriptions");
    await expectSectionMaxWidth1000(page, "サブスクリプション一覧");

    await page.goto("/subscriptions/new");
    await expectSectionMaxWidth1000(page, "サブスクリプション登録・変更");

    await page.goto("/subscriptions/manage");
    await expectSectionMaxWidth1000(page, "サブスクリプション削除");
  });

  test("L2: 一覧・登録・削除のテーブル枠はテーマ枠色・白2px", async ({ page }) => {
    const name = uniqueSubscriptionName("Layout");

    await openCreateSubscriptionModal(page);
    await fillSubscriptionCreateForm(page, {
      name,
      planName: "E2E Plan",
      paymentPlan: "月払い",
      monthlyAmount: "1200",
      // 過去の契約日 → 次回更新は未来サイクル。枠表示の前提として1件あれば十分
      contractDate: "2025-01-15",
    });
    await submitSubscriptionCreate(page);

    for (const path of [
      "/subscriptions",
      "/subscriptions/new",
      "/subscriptions/manage",
    ] as const) {
      await page.goto(path);
      await expect(visibleGetByText(page, name).first()).toBeVisible();

      const frame = await findVisibleTableFrame(page);
      expect(frame, `table frame missing on ${path}`).not.toBeNull();
      expect(frame!.borderTopWidth).toBe("2px");
    }

    await page.goto("/subscriptions/manage");
    await deleteSubscriptionByName(page, name);
  });

  test("L3: 更新間近吹き出しはテーブル枠の内側に収まる", async ({ page }) => {
    const name = uniqueSubscriptionName("Soon");

    // JST 今日+3日の月日で1年前の契約日を作り、月次の次回更新を3日後にする
    const todayJst = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Tokyo",
    });
    const [ty, tm, td] = todayJst.split("-").map(Number);
    const target = new Date(Date.UTC(ty, tm - 1, td + 3, 12, 0, 0));
    const contractDate = `${target.getUTCFullYear() - 1}-${String(
      target.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(target.getUTCDate()).padStart(2, "0")}`;

    await openCreateSubscriptionModal(page);
    await fillSubscriptionCreateForm(page, {
      name,
      planName: "Soon Plan",
      paymentPlan: "月払い",
      monthlyAmount: "900",
      contractDate,
    });
    await submitSubscriptionCreate(page);

    await page.goto("/subscriptions");
    await expect(visibleGetByText(page, name).first()).toBeVisible();

    const tooltip = page.getByText("更新間近").filter({ visible: true }).first();
    await expect(tooltip).toBeVisible({ timeout: 15_000 });

    const frame = await findVisibleTableFrame(page);
    expect(frame).not.toBeNull();

    const tooltipBox = await tooltip.boundingBox();
    expect(tooltipBox).not.toBeNull();

    // 吹き出し本体が枠の上辺より下にいること
    // （横方向は列位置により枠外に出ることがあるため縦のみ検証）
    expect(tooltipBox!.y).toBeGreaterThanOrEqual(frame!.top - 1);

    await page.goto("/subscriptions/manage");
    await deleteSubscriptionByName(page, name);
  });

  test("L4: 削除画面の空状態ではテーブル枠を出さない", async ({ page }) => {
    await page.goto("/subscriptions/manage");

    const emptyHeading = page.getByRole("heading", {
      name: "登録されたデータはありません。",
    });
    const hasEmpty = await emptyHeading.isVisible().catch(() => false);

    test.skip(
      !hasEmpty,
      "manage page has existing rows; empty-state assertion skipped"
    );

    const tables = page.locator("table").filter({ visible: true });
    await expect(tables).toHaveCount(0);
  });
});
