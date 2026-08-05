import {
  daysBetweenYmd,
  todayYmdInJst,
} from "@/lib/subscription/renewal-date";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

/** 一覧お知らせ・セル強調の閾値（日以内・当日含む） */
export const UPCOMING_RENEWAL_WITHIN_DAYS = 5;
export const UPCOMING_RENEWAL_URGENT_WITHIN_DAYS = 3;

/** 緊急度帯（色分け用）。3日以内が優先 */
export const UPCOMING_RENEWAL_URGENCY_TIERS = [3, 5] as const;

export type UpcomingRenewalUrgencyTier =
  (typeof UPCOMING_RENEWAL_URGENCY_TIERS)[number];

/** 次回更新日セル・吹き出しの背景色（`(app)` のテーマ CSS 変数） */
export const UPCOMING_RENEWAL_CELL_COLORS: Record<
  UpcomingRenewalUrgencyTier,
  string
> = {
  3: "var(--app-tag-urgent)",
  5: "var(--app-tag-soon)",
};

/** 「更新間近」ラベル・強調日付の文字色（背景とのコントラスト用） */
export const UPCOMING_RENEWAL_LABEL_TEXT_COLORS: Record<
  UpcomingRenewalUrgencyTier,
  string
> = {
  3: "var(--app-tag-urgent-fg)",
  5: "var(--app-tag-soon-fg)",
};

export type UpcomingRenewalNoticeItem = {
  id: string;
  displayName: string;
  /** 残り暦日（0 = 当日） */
  daysUntil: number;
  /** 色分け用（≤3 → 3、4〜5 → 5） */
  urgencyTier: UpcomingRenewalUrgencyTier;
  nextRenewalDate: string;
};

export function formatSubscriptionDisplayName(
  name: string,
  planName: string
): string {
  return `${name} ${planName}`;
}

/**
 * 残り日数から緊急度帯を返す。
 * 0〜3 → 3、4〜5 → 5、範囲外 → null
 */
export function getUpcomingRenewalUrgencyTier(
  daysUntil: number
): UpcomingRenewalUrgencyTier | null {
  if (daysUntil < 0 || daysUntil > UPCOMING_RENEWAL_WITHIN_DAYS) {
    return null;
  }
  if (daysUntil <= UPCOMING_RENEWAL_URGENT_WITHIN_DAYS) {
    return 3;
  }
  return 5;
}

/**
 * 次回更新日まで 0〜5 日（当日含む）のサブスクを抽出し、更新日昇順で返す。
 */
export function buildUpcomingRenewalNotices(
  subscriptions: ReadonlyArray<
    Pick<SavedSubscriptionRow, "id" | "name" | "planName" | "nextRenewalDate">
  >,
  asOfYmd: string = todayYmdInJst()
): UpcomingRenewalNoticeItem[] {
  const items: UpcomingRenewalNoticeItem[] = [];

  for (const subscription of subscriptions) {
    const daysUntil = daysBetweenYmd(asOfYmd, subscription.nextRenewalDate);
    const urgencyTier = getUpcomingRenewalUrgencyTier(daysUntil);
    if (urgencyTier === null) {
      continue;
    }

    items.push({
      id: subscription.id,
      displayName: formatSubscriptionDisplayName(
        subscription.name,
        subscription.planName
      ),
      daysUntil,
      urgencyTier,
      nextRenewalDate: subscription.nextRenewalDate,
    });
  }

  return items.toSorted((a, b) =>
    a.nextRenewalDate.localeCompare(b.nextRenewalDate)
  );
}
