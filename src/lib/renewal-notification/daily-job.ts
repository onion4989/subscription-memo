import type { PaymentPlan, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  notifyLeadDaysToNumber,
  resolveDisplayName,
} from "@/lib/renewal-notification/constants";
import { sendRenewalDigestEmail } from "@/lib/renewal-notification/send-digest";
import {
  computeNextRenewalDateYmd,
  computeNotifyDateYmd,
  todayYmdInJst,
  utcDateToYmd,
  ymdToUtcDate,
} from "@/lib/subscription/renewal-date";
import type { RenewalDigestLineItem } from "@/lib/renewal-notification/digest-email";
import type { PaymentPlanValue } from "@/lib/subscription/constants";

type PhaseOneCounters = {
  targetSubscriptions: number;
  sentUsers: number;
  sentSubscriptions: number;
  failedUsers: number;
};

type PhaseTwoCounters = {
  advancedSubscriptions: number;
};

export type RenewalNotificationJobResult = {
  asOfYmd: string;
  phase1: PhaseOneCounters;
  phase2: PhaseTwoCounters;
};

type CandidateRow = {
  id: string;
  userId: string;
  name: string;
  planName: string;
  paymentPlan: PaymentPlan;
  monthlyAmount: number | null;
  annualAmount: number | null;
  nextRenewalDateYmd: string;
  createdAtYmd: string;
  userEmail: string;
  userDisplayName: string;
  notifyDateYmd: string;
};

type GroupedCandidate = {
  userId: string;
  email: string;
  displayName: string;
  items: CandidateRow[];
};

function compareYmd(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function toDigestLineItem(candidate: CandidateRow): RenewalDigestLineItem {
  return {
    subscriptionName: candidate.name,
    planName: candidate.planName,
    paymentPlan: candidate.paymentPlan,
    renewalDateYmd: candidate.nextRenewalDateYmd,
    monthlyAmount: candidate.monthlyAmount,
    annualAmount: candidate.annualAmount,
  };
}

function groupCandidatesByUser(candidates: CandidateRow[]): GroupedCandidate[] {
  const grouped = new Map<string, GroupedCandidate>();

  for (const candidate of candidates) {
    const current = grouped.get(candidate.userId);
    if (current) {
      current.items.push(candidate);
      continue;
    }

    grouped.set(candidate.userId, {
      userId: candidate.userId,
      email: candidate.userEmail,
      displayName: candidate.userDisplayName,
      items: [candidate],
    });
  }

  return [...grouped.values()].map((entry) => ({
    ...entry,
    items: entry.items.toSorted((a, b) =>
      a.nextRenewalDateYmd.localeCompare(b.nextRenewalDateYmd)
    ),
  }));
}

async function runPhaseOne(asOfYmd: string): Promise<PhaseOneCounters> {
  const asOfDate = ymdToUtcDate(asOfYmd);

  const baseSubscriptions = await prisma.subscription.findMany({
    where: {
      notifyEnabled: true,
      nextRenewalDate: {
        gte: asOfDate,
      },
      user: {
        notifyDeliveryPaused: false,
        notifyChannel: "EMAIL",
        email: {
          not: null,
        },
        emailVerified: {
          not: null,
        },
      },
    },
    select: {
      id: true,
      userId: true,
      name: true,
      planName: true,
      paymentPlan: true,
      monthlyAmount: true,
      annualAmount: true,
      createdAt: true,
      nextRenewalDate: true,
      user: {
        select: {
          email: true,
          name: true,
          notifyLeadDays: true,
        },
      },
    },
  });

  const candidates: CandidateRow[] = [];
  for (const row of baseSubscriptions) {
    const nextRenewalDateYmd = utcDateToYmd(row.nextRenewalDate);
    const leadDays = notifyLeadDaysToNumber(row.user.notifyLeadDays);
    const notifyDateYmd = computeNotifyDateYmd(nextRenewalDateYmd, leadDays);
    const createdAtYmd = utcDateToYmd(row.createdAt);
    const userEmail = row.user.email;
    if (!userEmail) {
      continue;
    }

    // 通知日以前に登録されているサブスクのみ対象（遅延登録は除外）
    if (compareYmd(createdAtYmd, notifyDateYmd) > 0) {
      continue;
    }

    // 通知日以降は再送対象。更新日より後は対象外。
    if (compareYmd(notifyDateYmd, asOfYmd) > 0) {
      continue;
    }

    candidates.push({
      id: row.id,
      userId: row.userId,
      name: row.name,
      planName: row.planName,
      paymentPlan: row.paymentPlan,
      monthlyAmount: row.monthlyAmount,
      annualAmount: row.annualAmount,
      nextRenewalDateYmd,
      createdAtYmd,
      notifyDateYmd,
      userEmail,
      userDisplayName: resolveDisplayName(row.user.name),
    });
  }

  if (candidates.length === 0) {
    return {
      targetSubscriptions: 0,
      sentUsers: 0,
      sentSubscriptions: 0,
      failedUsers: 0,
    };
  }

  const renewalDateSet = new Set(candidates.map((row) => row.nextRenewalDateYmd));
  const existingLogs = await prisma.renewalNotificationLog.findMany({
    where: {
      subscriptionId: {
        in: candidates.map((row) => row.id),
      },
      renewalDate: {
        in: [...renewalDateSet].map((ymd) => ymdToUtcDate(ymd)),
      },
    },
    select: {
      subscriptionId: true,
      renewalDate: true,
    },
  });

  const loggedKeys = new Set(
    existingLogs.map(
      (log) => `${log.subscriptionId}:${utcDateToYmd(log.renewalDate)}`
    )
  );

  const unsentCandidates = candidates.filter(
    (row) => !loggedKeys.has(`${row.id}:${row.nextRenewalDateYmd}`)
  );
  const grouped = groupCandidatesByUser(unsentCandidates);

  const phase1: PhaseOneCounters = {
    targetSubscriptions: unsentCandidates.length,
    sentUsers: 0,
    sentSubscriptions: 0,
    failedUsers: 0,
  };

  for (const group of grouped) {
    try {
      await sendRenewalDigestEmail({
        to: group.email,
        displayName: group.displayName,
        items: group.items.map(toDigestLineItem),
      });

      await prisma.renewalNotificationLog.createMany({
        data: group.items.map((item) => ({
          subscriptionId: item.id,
          renewalDate: ymdToUtcDate(item.nextRenewalDateYmd),
        })),
        skipDuplicates: true,
      });

      phase1.sentUsers += 1;
      phase1.sentSubscriptions += group.items.length;
    } catch (error) {
      phase1.failedUsers += 1;
      console.error("[renewal-notification] digest send failed", {
        userId: group.userId,
        email: group.email,
        subscriptionCount: group.items.length,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return phase1;
}

/**
 * Phase 2: 期限切れ nextRenewalDate を契約日起点で「asOf より後」まで一気に同期する。
 * 中間サイクルへのメール遡及は行わない。
 */
async function runPhaseTwo(asOfYmd: string): Promise<PhaseTwoCounters> {
  const asOfDate = ymdToUtcDate(asOfYmd);
  const overdueSubscriptions = await prisma.subscription.findMany({
    where: {
      nextRenewalDate: {
        lt: asOfDate,
      },
    },
    select: {
      id: true,
      paymentPlan: true,
      contractDate: true,
      nextRenewalDate: true,
    },
  });

  if (overdueSubscriptions.length === 0) {
    return { advancedSubscriptions: 0 };
  }

  const updates: Prisma.PrismaPromise<unknown>[] = [];

  for (const subscription of overdueSubscriptions) {
    const storedYmd = utcDateToYmd(subscription.nextRenewalDate);
    const contractDateYmd = utcDateToYmd(subscription.contractDate);
    const targetYmd = computeNextRenewalDateYmd(
      contractDateYmd,
      subscription.paymentPlan as PaymentPlanValue,
      asOfYmd
    );

    if (storedYmd === targetYmd) {
      continue;
    }

    updates.push(
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          nextRenewalDate: ymdToUtcDate(targetYmd),
        },
      })
    );
  }

  if (updates.length === 0) {
    return { advancedSubscriptions: 0 };
  }

  await prisma.$transaction(updates);

  return {
    advancedSubscriptions: updates.length,
  };
}

export async function runRenewalNotificationDailyJob(params?: {
  asOfYmd?: string;
}): Promise<RenewalNotificationJobResult> {
  const asOfYmd = params?.asOfYmd ?? todayYmdInJst();
  // 先に期限切れを追いつかせてから通知する（古い日付のまま Phase1 しない）
  const phase2 = await runPhaseTwo(asOfYmd);
  const phase1 = await runPhaseOne(asOfYmd);

  return {
    asOfYmd,
    phase1,
    phase2,
  };
}
