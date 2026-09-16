import { expect, test } from "@playwright/test";

const LEAD_DAY_LABELS = [
  "3日前",
  "5日前",
  "1週間前（7暦日）",
] as const;

test.describe("P1-S settings", () => {
  // Shared E2E user: avoid racing notification settings mutations
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "一般設定" })).toBeVisible();
  });

  test("S1: settings page shows notification section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "お知らせ設定" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "二段階認証（MFA）" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "保存", exact: true })).toBeVisible();
  });

  test("S2: lead days can be changed, saved, and restored", async ({ page }) => {
    let originalLabel = LEAD_DAY_LABELS[0];
    for (const label of LEAD_DAY_LABELS) {
      const radio = page.getByRole("radio", { name: label });
      if (await radio.isChecked()) {
        originalLabel = label;
        break;
      }
    }

    const nextLabel =
      LEAD_DAY_LABELS.find((label) => label !== originalLabel) ?? "5日前";

    await page
      .locator("label")
      .filter({ hasText: nextLabel })
      .click();
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("お知らせ設定を保存しました。")).toBeVisible({
      timeout: 15_000,
    });

    await page.reload();
    await expect(page.getByRole("radio", { name: nextLabel })).toBeChecked();

    await page
      .locator("label")
      .filter({ hasText: originalLabel })
      .click();
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("お知らせ設定を保存しました。")).toBeVisible({
      timeout: 15_000,
    });
    await page.reload();
    await expect(page.getByRole("radio", { name: originalLabel })).toBeChecked();
  });

  test("S3: pause-all notifications can be toggled on and off", async ({
    page,
  }) => {
    const pause = page.getByRole("checkbox", {
      name: "お知らせをすべて停止する",
    });
    const wasPaused = await pause.isChecked();

    if (!wasPaused) {
      await pause.check();
      await page.getByRole("button", { name: "保存", exact: true }).click();
      await expect(page.getByText("お知らせ設定を保存しました。")).toBeVisible({
        timeout: 15_000,
      });
      await page.reload();
      await expect(
        page.getByRole("checkbox", { name: "お知らせをすべて停止する" })
      ).toBeChecked();
    }

    await page
      .getByRole("checkbox", { name: "お知らせをすべて停止する" })
      .uncheck();
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("お知らせ設定を保存しました。")).toBeVisible({
      timeout: 15_000,
    });
    await page.reload();
    await expect(
      page.getByRole("checkbox", { name: "お知らせをすべて停止する" })
    ).not.toBeChecked();

    if (wasPaused) {
      await page
        .getByRole("checkbox", { name: "お知らせをすべて停止する" })
        .check();
      await page.getByRole("button", { name: "保存", exact: true }).click();
      await expect(page.getByText("お知らせ設定を保存しました。")).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test("S4: SMS channel is disabled with hint", async ({ page }) => {
    await expect(
      page.getByRole("radio", { name: "電話のショートメッセージに送信する" })
    ).toBeDisabled();
    await expect(
      page.getByText("ショートメッセージでのお知らせは現在ご利用いただけません。")
    ).toBeVisible();
  });

  test("S5: MFA section shows disabled copy and setup dialog opens", async ({
    page,
  }) => {
    await expect(
      page.getByText(
        "メールとパスワードに加え、認証アプリ（Google Authenticator 等）でログインを保護できます。設定は任意です。"
      )
    ).toBeVisible();

    await page.getByRole("button", { name: "MFA を設定する" }).click();
    await expect(page.getByRole("heading", { name: "MFA設定" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
