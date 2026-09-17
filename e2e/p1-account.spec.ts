import { expect, test } from "@playwright/test";

test.describe("P1-A account", () => {
  // Shared E2E user: avoid racing profile mutations
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "プロフィール" })).toBeVisible();
  });

  test("A1: account page shows profile fields and save", async ({ page }) => {
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#phoneNumber")).toBeVisible();
    await expect(page.getByRole("group", { name: "アバター" })).toBeVisible();
    await expect(page.getByRole("button", { name: "保存", exact: true })).toBeVisible();
    await expect(page.locator("#currentPassword")).toBeVisible();
    await expect(page.locator("#newPassword")).toBeVisible();
  });

  test("A2: nickname can be saved and restored", async ({ page }) => {
    const nameInput = page.locator("#name");
    const original = await nameInput.inputValue();
    const nextName =
      original === "E2ENick" ? "E2ENick2" : "E2ENick";

    await nameInput.fill(nextName);
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("プロフィールを保存しました。")).toBeVisible({
      timeout: 15_000,
    });

    await page.reload();
    await expect(page.locator("#name")).toHaveValue(nextName);

    await page.locator("#name").fill(original);
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("プロフィールを保存しました。")).toBeVisible({
      timeout: 15_000,
    });
    await page.reload();
    await expect(page.locator("#name")).toHaveValue(original);
  });

  test("A3: empty nickname shows validation error (email change skipped)", async ({
    page,
  }) => {
    await page.locator("#name").fill("");
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("ニックネームを入力してください")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("A4: password change failure paths do not change password", async ({
    page,
  }) => {
    await page.locator("#currentPassword").fill("definitely-wrong-password-xxx");
    await page.locator("#newPassword").fill("short");
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(
      page.getByText("新しいパスワードは8文字以上で入力してください")
    ).toBeVisible({ timeout: 15_000 });

    await page.locator("#currentPassword").fill("definitely-wrong-password-xxx");
    await page.locator("#newPassword").fill("long-enough-but-wrong-current");
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(
      page.getByText("現在のパスワードが正しくありません。")
    ).toBeVisible({ timeout: 15_000 });
  });

  test("A5: avatar can be selected, saved, and restored", async ({ page }) => {
    const radios = page.locator('input[name="avatarId"]');
    await expect(radios.first()).toBeAttached();

    const count = await radios.count();
    let originalId = "1";
    for (let i = 0; i < count; i++) {
      if (await radios.nth(i).isChecked()) {
        originalId = (await radios.nth(i).inputValue()) ?? "1";
        break;
      }
    }

    const nextId = originalId === "1" ? "2" : "1";
    await page.locator(`label[aria-label="アバター ${nextId}"]`).click();
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("プロフィールを保存しました。")).toBeVisible({
      timeout: 15_000,
    });

    await page.reload();
    await expect(page.locator(`input[name="avatarId"][value="${nextId}"]`)).toBeChecked();

    await page.locator(`label[aria-label="アバター ${originalId}"]`).click();
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect(page.getByText("プロフィールを保存しました。")).toBeVisible({
      timeout: 15_000,
    });
    await page.reload();
    await expect(
      page.locator(`input[name="avatarId"][value="${originalId}"]`)
    ).toBeChecked();
  });
});
