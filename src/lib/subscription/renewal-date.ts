import type { PaymentPlanValue } from "@/lib/subscription/constants";

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

export function computeNextRenewalDateYmd(
  contractDateYmd: string,
  paymentPlan: PaymentPlanValue
): string {
  if (paymentPlan === "MONTHLY") {
    return addMonthsToYmd(contractDateYmd, 1);
  }

  return addYearsToYmd(contractDateYmd, 1);
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
