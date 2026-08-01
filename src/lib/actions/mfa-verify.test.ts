import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  auth,
  unstableUpdate,
  findUniqueUser,
  verifyTotpToken,
  consumeBackupCode,
  isLockedOut,
  recordAttempt,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  unstableUpdate: vi.fn(),
  findUniqueUser: vi.fn(),
  verifyTotpToken: vi.fn(),
  consumeBackupCode: vi.fn(),
  isLockedOut: vi.fn(),
  recordAttempt: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth, unstable_update: unstableUpdate }));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: findUniqueUser } },
}));

vi.mock("@/lib/mfa/totp", () => ({ verifyTotpToken }));

vi.mock("@/lib/mfa/backup-codes", () => ({ consumeBackupCode }));

vi.mock("@/lib/mfa/lockout", () => ({ isLockedOut, recordAttempt }));

import { completeMfaVerification } from "@/lib/actions/mfa-verify";

const initialState = { success: false };

function verifyFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

describe("completeMfaVerification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({
      user: { id: "user-1", totpEnabled: true, mfaVerified: false },
    });
    findUniqueUser.mockResolvedValue({
      totpEnabled: true,
      totpSecret: "SECRET",
    });
    isLockedOut.mockResolvedValue(false);
  });

  it("バックアップコードが一致すると認証を通す", async () => {
    consumeBackupCode.mockResolvedValue(true);

    const result = await completeMfaVerification(
      initialState,
      verifyFormData({ mode: "backup", backupCode: "aaaa-bbbb-cc" })
    );

    expect(result.success).toBe(true);
    expect(consumeBackupCode).toHaveBeenCalledWith("user-1", "aaaa-bbbb-cc");
    expect(recordAttempt).toHaveBeenCalledWith("user-1", true);
    expect(unstableUpdate).toHaveBeenCalledWith({
      user: { mfaVerified: true },
    });
  });

  it("バックアップコードが一致しないと失敗を記録して拒否する", async () => {
    consumeBackupCode.mockResolvedValue(false);

    const result = await completeMfaVerification(
      initialState,
      verifyFormData({ mode: "backup", backupCode: "ZZZZ-ZZZZ-ZZ" })
    );

    expect(result.success).toBe(false);
    expect(result.mode).toBe("backup");
    expect(result.error).toBe("バックアップコードが正しくありません");
    expect(recordAttempt).toHaveBeenCalledWith("user-1", false);
    expect(unstableUpdate).not.toHaveBeenCalled();
  });

  it("バックアップコードが空のときは照合しない", async () => {
    const result = await completeMfaVerification(
      initialState,
      verifyFormData({ mode: "backup", backupCode: "   " })
    );

    expect(result.success).toBe(false);
    expect(result.mode).toBe("backup");
    expect(consumeBackupCode).not.toHaveBeenCalled();
  });

  it("ロック中はバックアップコードも受け付けない", async () => {
    isLockedOut.mockResolvedValue(true);

    const result = await completeMfaVerification(
      initialState,
      verifyFormData({ mode: "backup", backupCode: "AAAA-BBBB-CC" })
    );

    expect(result.locked).toBe(true);
    expect(consumeBackupCode).not.toHaveBeenCalled();
  });

  it("mode 未指定のときは従来どおり TOTP を検証する", async () => {
    verifyTotpToken.mockReturnValue(true);

    const result = await completeMfaVerification(
      initialState,
      verifyFormData({ token: "123456" })
    );

    expect(result.success).toBe(true);
    expect(verifyTotpToken).toHaveBeenCalledWith("SECRET", "123456");
    expect(consumeBackupCode).not.toHaveBeenCalled();
  });

  it("TOTP が誤りのときは totp モードのエラーを返す", async () => {
    verifyTotpToken.mockReturnValue(false);

    const result = await completeMfaVerification(
      initialState,
      verifyFormData({ mode: "totp", token: "000000" })
    );

    expect(result.success).toBe(false);
    expect(result.mode).toBe("totp");
    expect(result.error).toBe("認証コードが正しくありません");
  });
});
