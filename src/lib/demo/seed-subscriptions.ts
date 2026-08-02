import type { PaymentPlan, Prisma } from "@prisma/client";
import {
  addMonthsToYmd,
  computeNextRenewalDateYmd,
  todayYmdInJst,
  ymdToUtcDate,
} from "@/lib/subscription/renewal-date";

type DemoSubscriptionSeed = {
  name: string;
  planName: string;
  paymentPlan: PaymentPlan;
  monthlyAmount: number | null;
  annualAmount: number | null;
  /** asOf から何ヶ月前を契約日の基準にするか */
  contractMonthsAgo: number;
  /** 基準日に何日足すか（更新間近の演出用） */
  contractDayOffset?: number;
};

/**
 * デモ一覧の見本データ。日付は実行時の JST 今日を基準に毎回計算する。
 * notifyEnabled はすべて false（example.com への誤送信を防ぐ）。
 */
const DEMO_SUBSCRIPTION_SEEDS: DemoSubscriptionSeed[] = [
  {
    name: "Netflix",
    planName: "スタンダード",
    paymentPlan: "MONTHLY",
    monthlyAmount: 1490,
    annualAmount: 17_880,
    contractMonthsAgo: 1,
    contractDayOffset: 2,
  },
  {
    name: "Spotify",
    planName: "Premium",
    paymentPlan: "MONTHLY",
    monthlyAmount: 980,
    annualAmount: 11_760,
    contractMonthsAgo: 2,
    contractDayOffset: 4,
  },
  {
    name: "Amazon",
    planName: "Prime",
    paymentPlan: "YEARLY",
    monthlyAmount: 500,
    annualAmount: 5900,
    contractMonthsAgo: 3,
  },
  {
    name: "ChatGPT",
    planName: "Plus",
    paymentPlan: "MONTHLY",
    monthlyAmount: 3000,
    annualAmount: 36_000,
    contractMonthsAgo: 1,
    contractDayOffset: 12,
  },
  {
    name: "YouTube",
    planName: "Premium",
    paymentPlan: "MONTHLY",
    monthlyAmount: 1280,
    annualAmount: 15_360,
    contractMonthsAgo: 4,
    contractDayOffset: -5,
  },
  {
    name: "Adobe",
    planName: "Creative Cloud",
    paymentPlan: "YEARLY",
    monthlyAmount: 6280,
    annualAmount: 72_336,
    contractMonthsAgo: 6,
  },
];

function addDaysToYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function buildContractDateYmd(
  asOfYmd: string,
  seed: DemoSubscriptionSeed
): string {
  const base = addMonthsToYmd(asOfYmd, -seed.contractMonthsAgo);
  return addDaysToYmd(base, seed.contractDayOffset ?? 0);
}

export function buildDemoSubscriptionCreateMany(
  userId: string,
  asOfYmd: string = todayYmdInJst()
): Prisma.SubscriptionCreateManyInput[] {
  return DEMO_SUBSCRIPTION_SEEDS.map((seed) => {
    const contractDateYmd = buildContractDateYmd(asOfYmd, seed);
    const nextRenewalDateYmd = computeNextRenewalDateYmd(
      contractDateYmd,
      seed.paymentPlan,
      asOfYmd
    );

    return {
      userId,
      name: seed.name,
      planName: seed.planName,
      paymentPlan: seed.paymentPlan,
      monthlyAmount: seed.monthlyAmount,
      annualAmount: seed.annualAmount,
      contractDate: ymdToUtcDate(contractDateYmd),
      nextRenewalDate: ymdToUtcDate(nextRenewalDateYmd),
      notifyEnabled: false,
    };
  });
}
