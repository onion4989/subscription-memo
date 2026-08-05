import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  upsertUser,
  deleteManySubscriptions,
  deleteManyBackupCodes,
  deleteManyLoginAttempts,
  createManySubscriptions,
  transaction,
  hash,
} = vi.hoisted(() => ({
  upsertUser: vi.fn(),
  deleteManySubscriptions: vi.fn(() => ({ op: "subscription.deleteMany" })),
  deleteManyBackupCodes: vi.fn(() => ({ op: "backupCode.deleteMany" })),
  deleteManyLoginAttempts: vi.fn(() => ({ op: "loginAttempt.deleteMany" })),
  createManySubscriptions: vi.fn(),
  transaction: vi.fn(),
  hash: vi.fn(async () => "hashed-demo-password"),
}));

vi.mock("bcryptjs", () => ({ hash }));

import { resetDemoAccount } from "@/lib/demo/reset-demo-account";
import { DEMO_USER_EMAIL } from "@/lib/demo/constants";

const prisma = {
  user: { upsert: upsertUser },
  subscription: {
    deleteMany: deleteManySubscriptions,
    createMany: createManySubscriptions,
  },
  backupCode: { deleteMany: deleteManyBackupCodes },
  loginAttempt: { deleteMany: deleteManyLoginAttempts },
  $transaction: transaction,
};

describe("resetDemoAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertUser.mockResolvedValue({ id: "demo-user-id", email: DEMO_USER_EMAIL });
    transaction.mockResolvedValue([{}, {}, {}]);
    createManySubscriptions.mockResolvedValue({ count: 6 });
  });

  it("upserts the demo user, clears related rows, and reseeds subscriptions", async () => {
    const result = await resetDemoAccount(prisma as never, {
      asOfYmd: "2026-08-02",
      password: "demo1234",
    });

    expect(hash).toHaveBeenCalledWith("demo1234", 12);
    expect(upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: DEMO_USER_EMAIL },
        create: expect.objectContaining({
          email: DEMO_USER_EMAIL,
          emailVerified: expect.any(Date),
          notifyDeliveryPaused: true,
          totpEnabled: false,
          passwordHash: "hashed-demo-password",
          themeId: "default",
        }),
        update: expect.objectContaining({
          notifyDeliveryPaused: true,
          totpEnabled: false,
          totpSecret: null,
          passwordHash: "hashed-demo-password",
          themeId: "default",
        }),
      })
    );

    expect(transaction).toHaveBeenCalled();
    expect(deleteManySubscriptions).toHaveBeenCalledWith({
      where: { userId: "demo-user-id" },
    });
    expect(deleteManyBackupCodes).toHaveBeenCalledWith({
      where: { userId: "demo-user-id" },
    });
    expect(deleteManyLoginAttempts).toHaveBeenCalledWith({
      where: { userId: "demo-user-id" },
    });

    expect(createManySubscriptions).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          userId: "demo-user-id",
          notifyEnabled: false,
        }),
      ]),
    });
    expect(createManySubscriptions.mock.calls[0][0].data).toHaveLength(6);

    expect(result).toEqual({
      userId: "demo-user-id",
      email: DEMO_USER_EMAIL,
      subscriptionCount: 6,
      asOfYmd: "2026-08-02",
    });
  });
});
