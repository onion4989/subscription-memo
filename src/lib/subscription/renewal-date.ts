import type { PaymentPlanValue } from "@/lib/subscription/constants";

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const JST_TIME_ZONE = "Asia/Tokyo";

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseYmd(ymd: string): { year: number; month: number; day: number } {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

function formatYmd(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function compareYmd(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function stepRenewalByPlan(
  ymd: string,
  paymentPlan: PaymentPlanValue
): string {
  if (paymentPlan === "MONTHLY") {
    return addMonthsToYmd(ymd, 1);
  }

  return addYearsToYmd(ymd, 1);
}

/** JST の今日を YYYY-MM-DD で返す（サーバー・クライアント共通） */
export function todayYmdInJst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isValidYmd(value: string): boolean {
  if (!YMD_PATTERN.test(value)) {
    return false;
  }

  const { year, month, day } = parseYmd(value);
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }

  return day <= daysInMonth(year, month);
}

export function addMonthsToYmd(ymd: string, months: number): string {
  const { year, month, day } = parseYmd(ymd);
  const totalMonths = year * 12 + (month - 1) + months;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1;
  const newDay = Math.min(day, daysInMonth(newYear, newMonth));
  return formatYmd(newYear, newMonth, newDay);
}

export function addYearsToYmd(ymd: string, years: number): string {
  const { year, month, day } = parseYmd(ymd);
  const newYear = year + years;
  const newDay = Math.min(day, daysInMonth(newYear, month));
  return formatYmd(newYear, month, newDay);
}

/**
 * 次回更新日を算出する。
 * - 未来の契約日: 契約日 + 1 期間
 * - 過去・今日の契約日: 契約日を起点に asOf より後の最初の更新日
 * - asOf がサイクル上の更新日と一致: 翌サイクル（当日は含めない）
 */
export function computeNextRenewalDateYmd(
  contractDateYmd: string,
  paymentPlan: PaymentPlanValue,
  asOfYmd: string = todayYmdInJst()
): string {
  if (compareYmd(contractDateYmd, asOfYmd) > 0) {
    return stepRenewalByPlan(contractDateYmd, paymentPlan);
  }

  let candidate = contractDateYmd;
  while (compareYmd(candidate, asOfYmd) <= 0) {
    candidate = stepRenewalByPlan(candidate, paymentPlan);
  }

  return candidate;
}

/** 日次ジョブ Phase 2: 現在の更新日を翌サイクルへ繰り上げる */
export function advanceRenewalDateToNextCycleYmd(
  renewalDateYmd: string,
  paymentPlan: PaymentPlanValue
): string {
  return stepRenewalByPlan(renewalDateYmd, paymentPlan);
}

/** 暦日を減算（通知日 = 更新日 − N 日） */
export function subtractDaysFromYmd(ymd: string, days: number): string {
  const { year, month, day } = parseYmd(ymd);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  date.setUTCDate(date.getUTCDate() - days);
  return formatYmd(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );
}

/** お知らせ日（更新日の N 暦日前） */
export function computeNotifyDateYmd(
  nextRenewalDateYmd: string,
  leadDays: number
): string {
  return subtractDaysFromYmd(nextRenewalDateYmd, leadDays);
}

/** PostgreSQL @db.Date 保存用（UTC 正午で日付ずれを防ぐ） */
export function ymdToUtcDate(ymd: string): Date {
  const { year, month, day } = parseYmd(ymd);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

/** DB Date を JST カレンダー日付 YYYY-MM-DD として表示 */
export function utcDateToYmd(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return formatYmd(year, month, day);
}
