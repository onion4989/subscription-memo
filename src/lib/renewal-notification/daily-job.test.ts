import { beforeEach, describe, expect, it, vi } from "vitest";
import { ymdToUtcDate } from "@/lib/subscription/renewal-date";

const {
  findManySubscriptions,
  findManyLogs,
  createManyLogs,
  updateSubscription,
  transaction,
  sendRenewalDigestEmail,
} = vi.hoisted(() => ({
  findManySubscriptions: vi.fn(),
  findManyLogs: vi.fn(),
  createManyLogs: vi.fn(),
  updateSubscription: vi.fn(),
  transaction: vi.fn(),
  sendRenewalDigestEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findMany: findManySubscriptions,
      update: updateSubscription,
    },
    renewalNotificationLog: {
      findMany: findManyLogs,
      createMany: createManyLogs,
    },
    $transaction: transaction,
  },
}));

vi.mock("@/lib/renewal-notification/send-digest", () => ({
  sendRenewalDigestEmail,
}));

import { runRenewalNotificationDailyJob } from "@/lib/renewal-notification/daily-job";

type SubscriptionRow = {
  id: string;
  userId: string;
  name: string;
  planName: string;
  paymentPlan: "MONTHLY" | "YEARLY";
  monthlyAmount: number | null;
  annualAmount: number | null;
  createdAt: Date;
  nextRenewalDate: Date;
  user: {
    email: string | null;
    name: string | null;
    notifyLeadDays: "THREE_DAYS" | "FIVE_DAYS" | "SEVEN_DAYS";
  };
};

type PhaseTwoRow = {
  id: string;
  paymentPlan: "MONTHLY" | "YEARLY";
  contractDate: Date;
  nextRenewalDate: Date;
};

function subscriptionRow(
  overrides: Partial<SubscriptionRow> &
    Pick<SubscriptionRow, "id" | "nextRenewalDate" | "createdAt">
): SubscriptionRow {
  return {
    userId: "user-1",
    name: "Netflix",
    planName: "Standard",
    paymentPlan: "MONTHLY",
    monthlyAmount: 1490,
    annualAmount: null,
    user: {
      email: "user@example.com",
      name: "太郎",
      notifyLeadDays: "FIVE_DAYS",
    },
    ...overrides,
  };
}

/** Phase2 → Phase1 の順で findMany が呼ばれる想定のモック */
function mockPhase2ThenPhase1(
  phase2Rows: PhaseTwoRow[],
  phase1Rows: SubscriptionRow[]
) {
  findManySubscriptions
    .mockResolvedValueOnce(phase2Rows)
    .mockResolvedValueOnce(phase1Rows);
}

describe("runRenewalNotificationDailyJob (J1–J9)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManySubscriptions.mockResolvedValue([]);
    findManyLogs.mockResolvedValue([]);
    createManyLogs.mockResolvedValue({ count: 0 });
    updateSubscription.mockResolvedValue({});
    transaction.mockResolvedValue([]);
    sendRenewalDigestEmail.mockResolvedValue(undefined);
  });

  it("J1: sends digest when asOfYmd equals notify date", async () => {
    // renewal 2026-07-26, FIVE_DAYS → notify 2026-07-21
    mockPhase2ThenPhase1(
      [],
      [
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ]
    );

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-21",
    });

    expect(sendRenewalDigestEmail).toHaveBeenCalledTimes(1);
    expect(sendRenewalDigestEmail).toHaveBeenCalledWith({
      to: "user@example.com",
      displayName: "太郎",
      items: [
        expect.objectContaining({
          subscriptionName: "Netflix",
          renewalDateYmd: "2026-07-26",
        }),
      ],
    });
    expect(createManyLogs).toHaveBeenCalledWith({
      data: [
        {
          subscriptionId: "sub-1",
          renewalDate: ymdToUtcDate("2026-07-26"),
        },
      ],
      skipDuplicates: true,
    });
    expect(result).toEqual({
      asOfYmd: "2026-07-21",
      phase1: {
        targetSubscriptions: 1,
        sentUsers: 1,
        sentSubscriptions: 1,
        failedUsers: 0,
      },
      phase2: { advancedSubscriptions: 0 },
    });
  });

  it("J2: does not send before notify date", async () => {
    mockPhase2ThenPhase1(
      [],
      [
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ]
    );

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-20",
    });

    expect(sendRenewalDigestEmail).not.toHaveBeenCalled();
    expect(createManyLogs).not.toHaveBeenCalled();
    expect(result.phase1).toEqual({
      targetSubscriptions: 0,
      sentUsers: 0,
      sentSubscriptions: 0,
      failedUsers: 0,
    });
  });

  it("J3: skips subscriptions already logged for that renewal date", async () => {
    mockPhase2ThenPhase1(
      [],
      [
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ]
    );
    findManyLogs.mockResolvedValueOnce([
      {
        subscriptionId: "sub-1",
        renewalDate: ymdToUtcDate("2026-07-26"),
      },
    ]);

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-21",
    });

    expect(sendRenewalDigestEmail).not.toHaveBeenCalled();
    expect(createManyLogs).not.toHaveBeenCalled();
    expect(result.phase1.targetSubscriptions).toBe(0);
  });

  it("J4: skips late registration (created after notify date)", async () => {
    mockPhase2ThenPhase1(
      [],
      [
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          // notify date is 2026-07-21; created after that
          createdAt: ymdToUtcDate("2026-07-22"),
        }),
      ]
    );

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-21",
    });

    expect(sendRenewalDigestEmail).not.toHaveBeenCalled();
    expect(result.phase1.targetSubscriptions).toBe(0);
  });

  it("J5: does not write log when send fails", async () => {
    mockPhase2ThenPhase1(
      [],
      [
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ]
    );
    sendRenewalDigestEmail.mockRejectedValueOnce(new Error("SMTP down"));

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-21",
    });

    expect(createManyLogs).not.toHaveBeenCalled();
    expect(result.phase1).toEqual({
      targetSubscriptions: 1,
      sentUsers: 0,
      sentSubscriptions: 0,
      failedUsers: 1,
    });
  });

  it("J6: digests multiple subscriptions for the same user into one email", async () => {
    mockPhase2ThenPhase1(
      [],
      [
        subscriptionRow({
          id: "sub-1",
          name: "Netflix",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
        subscriptionRow({
          id: "sub-2",
          name: "Spotify",
          planName: "Premium",
          nextRenewalDate: ymdToUtcDate("2026-07-28"),
          createdAt: ymdToUtcDate("2026-01-01"),
          user: {
            email: "user@example.com",
            name: "太郎",
            notifyLeadDays: "FIVE_DAYS",
          },
        }),
      ]
    );

    // asOf 2026-07-23: Netflix notify=07-21 (eligible), Spotify renew 07-28 notify=07-23 (eligible)
    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-23",
    });

    expect(sendRenewalDigestEmail).toHaveBeenCalledTimes(1);
    expect(sendRenewalDigestEmail.mock.calls[0]?.[0].items).toHaveLength(2);
    expect(result.phase1).toEqual({
      targetSubscriptions: 2,
      sentUsers: 1,
      sentSubscriptions: 2,
      failedUsers: 0,
    });
  });

  it("J7: phase2 catches up multiple overdue cycles in one run", async () => {
    // contract 06-02, stored 08-02, asOf 10-12 → target 11-02（複数サイクル一気に）
    mockPhase2ThenPhase1(
      [
        {
          id: "sub-overdue",
          paymentPlan: "MONTHLY",
          contractDate: ymdToUtcDate("2026-06-02"),
          nextRenewalDate: ymdToUtcDate("2026-08-02"),
        },
      ],
      []
    );
    updateSubscription.mockReturnValueOnce(Promise.resolve({}));

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-10-12",
    });

    expect(updateSubscription).toHaveBeenCalledWith({
      where: { id: "sub-overdue" },
      data: {
        nextRenewalDate: ymdToUtcDate("2026-11-02"),
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(result.phase2).toEqual({ advancedSubscriptions: 1 });
  });

  it("J8: phase2 is a no-op when nextRenewalDate is already in the future", async () => {
    mockPhase2ThenPhase1([], []);

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-21",
    });

    expect(updateSubscription).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(result.phase2).toEqual({ advancedSubscriptions: 0 });
  });

  it("J9: runs phase2 before phase1", async () => {
    mockPhase2ThenPhase1([], []);

    await runRenewalNotificationDailyJob({ asOfYmd: "2026-07-21" });

    expect(findManySubscriptions).toHaveBeenCalledTimes(2);
    expect(findManySubscriptions.mock.calls[0]?.[0].where).toMatchObject({
      nextRenewalDate: { lt: ymdToUtcDate("2026-07-21") },
    });
    expect(findManySubscriptions.mock.calls[1]?.[0].where).toMatchObject({
      notifyEnabled: true,
      nextRenewalDate: { gte: ymdToUtcDate("2026-07-21") },
    });
  });

  it("queries phase1 candidates with notify and verified-email filters", async () => {
    mockPhase2ThenPhase1([], []);

    await runRenewalNotificationDailyJob({ asOfYmd: "2026-07-21" });

    const phase1Call = findManySubscriptions.mock.calls.find(
      (call) => call[0]?.where?.notifyEnabled === true
    );
    expect(phase1Call?.[0].where).toMatchObject({
      notifyEnabled: true,
      user: {
        notifyDeliveryPaused: false,
        notifyChannel: "EMAIL",
        emailVerified: { not: null },
      },
    });
  });
});
