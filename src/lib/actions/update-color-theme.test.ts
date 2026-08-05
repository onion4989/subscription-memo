import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthenticatedUserId,
  updateUser,
  revalidatePath,
} = vi.hoisted(() => ({
  getAuthenticatedUserId: vi.fn(),
  updateUser: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/get-user-id", () => ({ getAuthenticatedUserId }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: updateUser } },
}));
vi.mock("next/cache", () => ({ revalidatePath }));

import { updateColorTheme } from "@/lib/actions/update-color-theme";

describe("updateColorTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    getAuthenticatedUserId.mockResolvedValue(null);
    const result = await updateColorTheme("ocean");
    expect(result.success).toBe(false);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects invalid theme ids", async () => {
    getAuthenticatedUserId.mockResolvedValue("user-1");
    const result = await updateColorTheme("not-a-theme");
    expect(result.success).toBe(false);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("persists a valid theme and revalidates", async () => {
    getAuthenticatedUserId.mockResolvedValue("user-1");
    updateUser.mockResolvedValue({});
    const result = await updateColorTheme("ocean");
    expect(result).toEqual({ success: true, themeId: "ocean" });
    expect(updateUser).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { themeId: "ocean" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
