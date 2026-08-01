import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  auth,
  unstableUpdate,
  findUniqueUser,
  updateUser,
  deleteManyBackupCodes,
  transaction,
  compare,
  revalidatePath,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  unstableUpdate: vi.fn(),
  findUniqueUser: vi.fn(),
  updateUser: vi.fn(() => ({ op: "user.update" })),
  deleteManyBackupCodes: vi.fn(() => ({ op: "backupCode.deleteMany" })),
  transaction: vi.fn(),
  compare: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth, unstable_update: unstableUpdate }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: findUniqueUser, update: updateUser },
    backupCode: { deleteMany: deleteManyBackupCodes },
    $transaction: transaction,
  },
}));

vi.mock("bcryptjs", () => ({ compare }));

vi.mock("next/cache", () => ({ revalidatePath }));

import { disableMfa } from "@/lib/actions/mfa-disable";

const initialState = { success: false };

function passwordFormData(password: string): FormData {
  const formData = new FormData();
  formData.set("password", password);
  return formData;
}

describe("disableMfa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "user-1" } });
    findUniqueUser.mockResolvedValue({
      passwordHash: "stored-hash",
      totpEnabled: true,
    });
    transaction.mockResolvedValue([]);
  });

  it("解除と同時に残っているバックアップコードを削除する", async () => {
    compare.mockResolvedValue(true);

    const result = await disableMfa(initialState, passwordFormData("correct"));

    expect(result.success).toBe(true);
    expect(transaction).toHaveBeenCalledWith([
      { op: "user.update" },
      { op: "backupCode.deleteMany" },
    ]);
    expect(updateUser).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { totpEnabled: false, totpSecret: null },
    });
    expect(deleteManyBackupCodes).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("パスワードが誤りのときはコードを削除しない", async () => {
    compare.mockResolvedValue(false);

    const result = await disableMfa(initialState, passwordFormData("wrong"));

    expect(result.success).toBe(false);
    expect(transaction).not.toHaveBeenCalled();
    expect(deleteManyBackupCodes).not.toHaveBeenCalled();
  });
});
