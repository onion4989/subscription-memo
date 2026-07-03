import type { NotifyChannel, NotifyLeadDays } from "@prisma/client";

export const GUEST_DISPLAY_NAME = "ゲスト";

export const NOTIFY_LEAD_DAYS_OPTIONS = [
  { value: "THREE_DAYS", label: "3日前" },
  { value: "FIVE_DAYS", label: "5日前" },
  { value: "SEVEN_DAYS", label: "1週間前（7暦日）" },
] as const satisfies ReadonlyArray<{
  value: NotifyLeadDays;
  label: string;
}>;

export const NOTIFY_CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "メールに送信する" },
  { value: "SMS", label: "電話のショートメッセージに送信する" },
] as const satisfies ReadonlyArray<{
  value: NotifyChannel;
  label: string;
}>;

const LEAD_DAYS_BY_ENUM: Record<NotifyLeadDays, number> = {
  THREE_DAYS: 3,
  FIVE_DAYS: 5,
  SEVEN_DAYS: 7,
};

export function notifyLeadDaysToNumber(leadDays: NotifyLeadDays): number {
  return LEAD_DAYS_BY_ENUM[leadDays];
}

export function resolveDisplayName(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : GUEST_DISPLAY_NAME;
}
