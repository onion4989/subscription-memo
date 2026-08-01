import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  auth,
  findUniqueUser,
  updateUser,
  deleteManyBackupCodes,
  createManyBackupCodes,
  transaction,
  verifyTotpToken,
  prepareBackupCodes,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  findUniqueUser: vi.fn(),
  updateUser: vi.fn(() => ({ op: "user.update" })),
  deleteManyBackupCodes: vi.fn(() => ({ op: "backupCode.deleteMany" })),
  createManyBackupCodes: vi.fn(() => ({ op: "backupCode.createMany" })),
  transaction: vi.fn(),
  verifyTotpToken: vi.fn(),
  prepareBackupCodes: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: findUniqueUser, update: updateUser },
    backupCode: {
      deleteMany: deleteManyBackupCodes,
      createMany: createManyBackupCodes,
    },
    $transaction: transaction,
  },
}));

vi.mock("@/lib/mfa/totp", () => ({
  verifyTotpToken,
  generateTotpSecret: vi.fn(() => "SECRET"),
  createTotpUri: vi.fn(() => "otpauth://totp/x"),
}));

vi.mock("@/lib/mfa/backup-codes", () => ({ prepareBackupCodes }));

import { confirmMfaSetup } from "@/lib/actions/mfa-setup";

const initialState = { step: "generate" } as const;

const preparedCodes = {
  codes: ["AAAA-BBBB-CC", "DDDD-EEEE-FF"],
  rows: [
    { userId: "user-1", codeHash: "hash-1" },
    { userId: "user-1", codeHash: "hash-2" },
  ],
};

function setupFormData(): FormData {
  const formData = new FormData();
  formData.set("secret", "SECRET");
  formData.set("token", "123456");
  formData.set("uri", "otpauth://totp/x");
  formData.set("email", "user@example.com");
  return formData;
}

describe("confirmMfaSetup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "user-1" } });
    prepareBackupCodes.mockResolvedValue(preparedCodes);
    transaction.mockResolvedValue([]);
  });

  it("認証コードが正しいとき、有効化とコード発行を同一トランザクションで行う", async () => {
    verifyTotpToken.mockReturnValue(true);

    const result = await confirmMfaSetup(initialState, setupFormData());

    expect(result.step).toBe("backup-codes");
    expect(result.backupCodes).toEqual(preparedCodes.codes);

    expect(transaction).toHaveBeenCalledWith([
      { op: "user.update" },
      { op: "backupCode.deleteMany" },
      { op: "backupCode.createMany" },
    ]);

    expect(updateUser).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { totpSecret: "SECRET", totpEnabled: true },
    });
    expect(deleteManyBackupCodes).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
    expect(createManyBackupCodes).toHaveBeenCalledWith({
      data: preparedCodes.rows,
    });
  });

  it("認証コードが誤りのときは何も書き込まない", async () => {
    verifyTotpToken.mockReturnValue(false);

    const result = await confirmMfaSetup(initialState, setupFormData());

    expect(result.step).toBe("verify");
    expect(result.backupCodes).toBeUndefined();
    expect(prepareBackupCodes).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it("書き込みに失敗したときは入力画面へ戻し、コードを返さない", async () => {
    verifyTotpToken.mockReturnValue(true);
    transaction.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await confirmMfaSetup(initialState, setupFormData());

    expect(result.step).toBe("verify");
    expect(result.backupCodes).toBeUndefined();
    expect(result.error).toBeDefined();
  });
});
