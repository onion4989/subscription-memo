import {
  UPCOMING_RENEWAL_CELL_COLORS,
  UPCOMING_RENEWAL_LABEL_TEXT_COLORS,
  type UpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";

/** モバイル詳細・簡易で tier 3（3日以内）に使うアクセント色 */
export const MOBILE_SUBSCRIPTION_URGENT_COLOR = "#9F193B";

export const MOBILE_SUBSCRIPTION_URGENT_FG_COLOR = "#FFFFFF";

export const MOBILE_NOTIFY_ON_COLOR = "#9F193B";

export const MOBILE_NOTIFY_OFF_COLOR = "#686868";

/** 登録・変更画面など、タップでダイアログを開くモバイルカード用 */
export const MOBILE_PRESSABLE_CARD_CLASS =
  "cursor-pointer transition-[transform,opacity] duration-150 ease-out active:scale-[0.98] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A3AB] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100";

export function getMobileUpcomingRenewalHighlightColors(
  urgencyTier: UpcomingRenewalUrgencyTier
): { backgroundColor: string; color: string } {
  if (urgencyTier === 3) {
    return {
      backgroundColor: MOBILE_SUBSCRIPTION_URGENT_COLOR,
      color: MOBILE_SUBSCRIPTION_URGENT_FG_COLOR,
    };
  }

  return {
    backgroundColor: UPCOMING_RENEWAL_CELL_COLORS[5],
    color: UPCOMING_RENEWAL_LABEL_TEXT_COLORS[5],
  };
}

export function getMobileUpcomingRenewalDotColor(
  urgencyTier: UpcomingRenewalUrgencyTier
): string {
  if (urgencyTier === 3) {
    return MOBILE_SUBSCRIPTION_URGENT_COLOR;
  }

  return UPCOMING_RENEWAL_CELL_COLORS[5];
}
