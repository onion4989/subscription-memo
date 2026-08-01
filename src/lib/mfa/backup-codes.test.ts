import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyBackupCodes, updateManyBackupCodes, hashMock, compareMock } =
  vi.hoisted(() => ({
    findManyBackupCodes: vi.fn(),
    updateManyBackupCodes: vi.fn(),
    hashMock: vi.fn(async (value: string) => `hashed:${value}`),
    compareMock: vi.fn(
      async (value: string, digest: string) => digest === `hashed:${value}`
    ),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    backupCode: {
      findMany: findManyBackupCodes,
      updateMany: updateManyBackupCodes,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  hash: hashMock,
  compare: compareMock,
}));

import {
  BACKUP_CODE_COUNT,
  BACKUP_CODE_LENGTH,
  consumeBackupCode,
  formatBackupCode,
  generateBackupCodes,
  normalizeBackupCode,
  prepareBackupCodes,
} from "@/lib/mfa/backup-codes";

const ALLOWED_CHARACTERS = /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]+$/;

describe("generateBackupCodes", () => {
  it("既定で 10 文字のコードを 10 件、重複なく作る", () => {
    const codes = generateBackupCodes();

    expect(codes).toHaveLength(BACKUP_CODE_COUNT);
    expect(new Set(codes).size).toBe(BACKUP_CODE_COUNT);

    for (const code of codes) {
      expect(code).toHaveLength(BACKUP_CODE_LENGTH);
    }
  });

  it("紛らわしい I / L / O / U を含まない文字集合だけを使う", () => {
    for (const code of generateBackupCodes()) {
      expect(code).toMatch(ALLOWED_CHARACTERS);
    }
  });
});

describe("formatBackupCode / normalizeBackupCode", () => {
  it("10 文字を 4-4-2 のハイフン区切りで表示する", () => {
    expect(formatBackupCode("A3F7K92MXQ")).toBe("A3F7-K92M-XQ");
  });

  it("小文字・ハイフン・空白を取り除いて保存形式へ戻す", () => {
    expect(normalizeBackupCode(" a3f7-k92m-xq ")).toBe("A3F7K92MXQ");
  });

  it("手書き転記のゆれ（O / I / L）を数字へ読み替える", () => {
    expect(normalizeBackupCode("OIL2345678")).toBe("0112345678");
  });

  it("整形した文字列は正規化で元へ戻る", () => {
    for (const code of generateBackupCodes()) {
      expect(normalizeBackupCode(formatBackupCode(code))).toBe(code);
    }
  });
});

describe("prepareBackupCodes", () => {
  it("表示用コードと保存用ハッシュを 10 件ずつ返す", async () => {
    const { codes, rows } = await prepareBackupCodes("user-1");

    expect(codes).toHaveLength(BACKUP_CODE_COUNT);
    expect(rows).toHaveLength(BACKUP_CODE_COUNT);

    for (const [index, row] of rows.entries()) {
      expect(row.userId).toBe("user-1");
      // 保存するのはハッシュのみで、平文はどの行にも現れない
      expect(row.codeHash).not.toBe(codes[index]);
      expect(row.codeHash).toBe(`hashed:${normalizeBackupCode(codes[index])}`);
    }
  });
});

describe("consumeBackupCode", () => {
  beforeEach(() => {
    findManyBackupCodes.mockReset();
    updateManyBackupCodes.mockReset();
  });

  it("一致したコードを使用済みにして true を返す", async () => {
    findManyBackupCodes.mockResolvedValue([
      { id: "code-1", codeHash: "hashed:AAAAAAAAAA" },
      { id: "code-2", codeHash: "hashed:A3F7K92MXQ" },
    ]);
    updateManyBackupCodes.mockResolvedValue({ count: 1 });

    await expect(consumeBackupCode("user-1", "a3f7-k92m-xq")).resolves.toBe(
      true
    );

    expect(findManyBackupCodes).toHaveBeenCalledWith({
      where: { userId: "user-1", usedAt: null },
      select: { id: true, codeHash: true },
    });
    expect(updateManyBackupCodes).toHaveBeenCalledWith({
      where: { id: "code-2", usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("一致しないコードでは何も更新しない", async () => {
    findManyBackupCodes.mockResolvedValue([
      { id: "code-1", codeHash: "hashed:AAAAAAAAAA" },
    ]);

    await expect(consumeBackupCode("user-1", "A3F7K92MXQ")).resolves.toBe(
      false
    );
    expect(updateManyBackupCodes).not.toHaveBeenCalled();
  });

  it("桁数が合わない入力では DB を参照しない", async () => {
    await expect(consumeBackupCode("user-1", "123456")).resolves.toBe(false);

    expect(findManyBackupCodes).not.toHaveBeenCalled();
    expect(updateManyBackupCodes).not.toHaveBeenCalled();
  });

  it("同時送信で先に使われていた場合は false を返す", async () => {
    findManyBackupCodes.mockResolvedValue([
      { id: "code-1", codeHash: "hashed:A3F7K92MXQ" },
    ]);
    updateManyBackupCodes.mockResolvedValue({ count: 0 });

    await expect(consumeBackupCode("user-1", "A3F7K92MXQ")).resolves.toBe(
      false
    );
  });

  it("未使用かつ本人のコードだけを照合対象にする", async () => {
    findManyBackupCodes.mockResolvedValue([]);

    await consumeBackupCode("user-2", "A3F7K92MXQ");

    expect(findManyBackupCodes).toHaveBeenCalledWith({
      where: { userId: "user-2", usedAt: null },
      select: { id: true, codeHash: true },
    });
  });
});
