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

describe("runRenewalNotificationDailyJob (J1–J7)", () => {
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
    findManySubscriptions
      .mockResolvedValueOnce([
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ])
      .mockResolvedValueOnce([]);

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
    findManySubscriptions
      .mockResolvedValueOnce([
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ])
      .mockResolvedValueOnce([]);

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
    findManySubscriptions
      .mockResolvedValueOnce([
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ])
      .mockResolvedValueOnce([]);
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
    findManySubscriptions
      .mockResolvedValueOnce([
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          // notify date is 2026-07-21; created after that
          createdAt: ymdToUtcDate("2026-07-22"),
        }),
      ])
      .mockResolvedValueOnce([]);

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-21",
    });

    expect(sendRenewalDigestEmail).not.toHaveBeenCalled();
    expect(result.phase1.targetSubscriptions).toBe(0);
  });

  it("J5: does not write log when send fails", async () => {
    findManySubscriptions
      .mockResolvedValueOnce([
        subscriptionRow({
          id: "sub-1",
          nextRenewalDate: ymdToUtcDate("2026-07-26"),
          createdAt: ymdToUtcDate("2026-01-01"),
        }),
      ])
      .mockResolvedValueOnce([]);
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
    findManySubscriptions
      .mockResolvedValueOnce([
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
          // THREE_DAYS → notify 2026-07-25; still eligible on 2026-07-25+
          // Use FIVE_DAYS with renewal 2026-07-26 for both, or adjust asOf
          createdAt: ymdToUtcDate("2026-01-01"),
          user: {
            email: "user@example.com",
            name: "太郎",
            notifyLeadDays: "FIVE_DAYS",
          },
        }),
      ])
      .mockResolvedValueOnce([]);

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

  it("J7: phase2 advances overdue nextRenewalDate to next cycle", async () => {
    findManySubscriptions
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "sub-overdue",
          paymentPlan: "MONTHLY",
          nextRenewalDate: ymdToUtcDate("2026-07-20"),
        },
      ]);
    updateSubscription.mockReturnValueOnce(Promise.resolve({}));

    const result = await runRenewalNotificationDailyJob({
      asOfYmd: "2026-07-21",
    });

    expect(updateSubscription).toHaveBeenCalledWith({
      where: { id: "sub-overdue" },
      data: {
        nextRenewalDate: ymdToUtcDate("2026-08-20"),
      },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(result.phase2).toEqual({ advancedSubscriptions: 1 });
  });

  it("queries phase1 candidates with notify and verified-email filters", async () => {
    findManySubscriptions.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    await runRenewalNotificationDailyJob({ asOfYmd: "2026-07-21" });

    expect(findManySubscriptions.mock.calls[0]?.[0].where).toMatchObject({
      notifyEnabled: true,
      user: {
        notifyDeliveryPaused: false,
        notifyChannel: "EMAIL",
        emailVerified: { not: null },
      },
    });
  });
});
