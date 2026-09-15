import { beforeEach, describe, expect, it, vi } from "vitest";
import { digestToken } from "@/lib/auth/token-digest";

const {
  deleteManyVerificationTokens,
  createVerificationToken,
  findUniqueVerificationToken,
  findUniqueUser,
  updateUser,
  transaction,
} = vi.hoisted(() => ({
  deleteManyVerificationTokens: vi.fn(),
  createVerificationToken: vi.fn(),
  findUniqueVerificationToken: vi.fn(),
  findUniqueUser: vi.fn(),
  updateUser: vi.fn(),
  transaction: vi.fn(async (ops: unknown[]) => ops),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
    verificationToken: {
      deleteMany: deleteManyVerificationTokens,
      create: createVerificationToken,
      findUnique: findUniqueVerificationToken,
    },
    user: {
      findUnique: findUniqueUser,
      update: updateUser,
    },
  },
}));

import {
  createEmailVerificationToken,
  verifyEmailVerificationToken,
} from "@/lib/email-verification/tokens";

describe("email verification tokens (sha256 lookup)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteManyVerificationTokens.mockResolvedValue({ count: 0 });
    createVerificationToken.mockResolvedValue({});
    transaction.mockImplementation(async (ops: unknown[]) => ops);
  });

  it("stores sha256 digest instead of the raw token", async () => {
    const raw = await createEmailVerificationToken("user@example.com");

    expect(raw).toHaveLength(64);
    expect(transaction).toHaveBeenCalled();
    expect(createVerificationToken).toHaveBeenCalledWith({
      data: {
        identifier: "user@example.com",
        token: digestToken(raw),
        expires: expect.any(Date),
      },
    });
  });

  it("verifies with a single findUnique by digest", async () => {
    const raw = "a".repeat(64);
    findUniqueVerificationToken.mockResolvedValue({
      identifier: "user@example.com",
      token: digestToken(raw),
      expires: new Date(Date.now() + 60_000),
    });
    findUniqueUser.mockResolvedValue({ id: "user-1" });

    const result = await verifyEmailVerificationToken(raw);

    expect(findUniqueVerificationToken).toHaveBeenCalledWith({
      where: { token: digestToken(raw) },
    });
    expect(result).toEqual({ ok: true, identifier: "user@example.com" });
    expect(transaction).toHaveBeenCalled();
  });

  it("returns TOKEN_NOT_FOUND when digest misses", async () => {
    findUniqueVerificationToken.mockResolvedValue(null);

    const result = await verifyEmailVerificationToken("missing-token");

    expect(result).toEqual({ ok: false, reason: "TOKEN_NOT_FOUND" });
    expect(findUniqueUser).not.toHaveBeenCalled();
  });

  it("returns TOKEN_EXPIRED and clears rows when past expires", async () => {
    findUniqueVerificationToken.mockResolvedValue({
      identifier: "user@example.com",
      token: digestToken("expired-token"),
      expires: new Date(Date.now() - 1000),
    });

    const result = await verifyEmailVerificationToken("expired-token");

    expect(result).toEqual({ ok: false, reason: "TOKEN_EXPIRED" });
    expect(deleteManyVerificationTokens).toHaveBeenCalledWith({
      where: { identifier: "user@example.com" },
    });
    expect(findUniqueUser).not.toHaveBeenCalled();
  });
});
