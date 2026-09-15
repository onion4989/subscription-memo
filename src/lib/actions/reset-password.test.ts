import { beforeEach, describe, expect, it, vi } from "vitest";
import { digestToken } from "@/lib/auth/token-digest";

const {
  findUniqueResetToken,
  updateUser,
  updateResetToken,
  transaction,
  hashPassword,
} = vi.hoisted(() => ({
  findUniqueResetToken: vi.fn(),
  updateUser: vi.fn(),
  updateResetToken: vi.fn(),
  transaction: vi.fn(async (ops: unknown[]) => ops),
  hashPassword: vi.fn(async () => "password-hash"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
    passwordResetToken: {
      findUnique: findUniqueResetToken,
      update: updateResetToken,
    },
    user: {
      update: updateUser,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  hash: hashPassword,
}));

import { resetPassword } from "@/lib/actions/reset-password";

function formDataWith(token: string, password: string): FormData {
  const formData = new FormData();
  formData.set("token", token);
  formData.set("password", password);
  return formData;
}

describe("resetPassword (sha256 lookup)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (ops: unknown[]) => ops);
  });

  it("looks up by digest and updates password once", async () => {
    const raw = "reset-raw-token";
    findUniqueResetToken.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      expires: new Date(Date.now() + 60_000),
      usedAt: null,
    });

    const result = await resetPassword(
      { success: false },
      formDataWith(raw, "new-password-1")
    );

    expect(findUniqueResetToken).toHaveBeenCalledWith({
      where: { tokenHash: digestToken(raw) },
      select: {
        id: true,
        userId: true,
        expires: true,
        usedAt: true,
      },
    });
    expect(result).toEqual({ success: true });
    expect(hashPassword).toHaveBeenCalledWith("new-password-1", 12);
    expect(transaction).toHaveBeenCalled();
  });

  it("rejects missing expired or used tokens", async () => {
    findUniqueResetToken.mockResolvedValue(null);
    await expect(
      resetPassword({ success: false }, formDataWith("x", "new-password-1"))
    ).resolves.toMatchObject({ success: false });

    findUniqueResetToken.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      expires: new Date(Date.now() - 1000),
      usedAt: null,
    });
    await expect(
      resetPassword({ success: false }, formDataWith("x", "new-password-1"))
    ).resolves.toMatchObject({ success: false });

    findUniqueResetToken.mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      expires: new Date(Date.now() + 60_000),
      usedAt: new Date(),
    });
    await expect(
      resetPassword({ success: false }, formDataWith("x", "new-password-1"))
    ).resolves.toMatchObject({ success: false });

    expect(transaction).not.toHaveBeenCalled();
  });
});
