import { formatContractDateYmd } from "@/lib/subscription/format";
import {
  daysBetweenYmd,
  todayYmdInJst,
} from "@/lib/subscription/renewal-date";
import {
  formatSubscriptionDisplayName,
  getUpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import {
  getMobileUpcomingRenewalDotColor,
  MOBILE_PRESSABLE_CARD_CLASS,
} from "@/components/features/subscription/subscription-mobile-colors";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type SubscriptionMobilePressActionLabel = "修正" | "削除";

type SubscriptionMobileSimpleCardProps = {
  subscription: SavedSubscriptionRow;
  className?: string;
  onPress?: () => void;
  pressActionLabel?: SubscriptionMobilePressActionLabel;
  disabled?: boolean;
};

const SIMPLE_AMOUNT_TEXT_CLASS = "text-[12px] font-normal leading-tight";

/** 列見出し・簡易カード行で共通の左右 padding */
export const SUBSCRIPTION_MOBILE_SIMPLE_ROW_PADDING_CLASS = "px-4";

/** 列見出し・簡易カード行で共通の3列グリッド（名前やや広め） */
export const SUBSCRIPTION_MOBILE_SIMPLE_ROW_CLASS =
  "grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_minmax(0,0.85fr)] items-center gap-2";

export const SUBSCRIPTION_MOBILE_SIMPLE_NAME_CELL_CLASS =
  "min-w-0 truncate text-left text-[12px] font-normal leading-tight";

export const SUBSCRIPTION_MOBILE_SIMPLE_NAME_HEADER_CELL_CLASS =
  "min-w-0 truncate text-left";

export const SUBSCRIPTION_MOBILE_SIMPLE_AMOUNT_CELL_CLASS = "text-left";

export const SUBSCRIPTION_MOBILE_SIMPLE_AMOUNT_HEADER_CLASS = "text-center";

export const SUBSCRIPTION_MOBILE_SIMPLE_DATE_HEADER_CLASS =
  "flex items-center gap-[3px] text-left";

export const SUBSCRIPTION_MOBILE_SIMPLE_DATE_CELL_CLASS =
  "flex items-center gap-[3px] text-left";

export const SUBSCRIPTION_MOBILE_SIMPLE_DATE_DOT_SLOT_CLASS =
  "inline-flex w-[10px] shrink-0 justify-center";

function SimplePrimaryBillingLine({
  subscription,
}: {
  subscription: SavedSubscriptionRow;
}): ReactNode {
  if (subscription.paymentPlan === "YEARLY") {
    if (subscription.annualAmount === null) {
      return <span className={SIMPLE_AMOUNT_TEXT_CLASS}>—</span>;
    }

    return (
      <span className={`${SIMPLE_AMOUNT_TEXT_CLASS} whitespace-nowrap`}>
        ￥
        <span className="font-bold">
          {subscription.annualAmount.toLocaleString("ja-JP")}
        </span>
        {" / 年"}
      </span>
    );
  }

  if (subscription.monthlyAmount === null) {
    return <span className={SIMPLE_AMOUNT_TEXT_CLASS}>—</span>;
  }

  return (
    <span className={`${SIMPLE_AMOUNT_TEXT_CLASS} whitespace-nowrap`}>
      ￥
      <span className="font-bold">
        {subscription.monthlyAmount.toLocaleString("ja-JP")}
      </span>
      {" / 月"}
    </span>
  );
}

export function SubscriptionMobileSimpleCard({
  subscription,
  className,
  onPress,
  pressActionLabel = "修正",
  disabled = false,
}: SubscriptionMobileSimpleCardProps) {
  const daysUntil = daysBetweenYmd(
    todayYmdInJst(),
    subscription.nextRenewalDate
  );
  const urgencyTier = getUpcomingRenewalUrgencyTier(daysUntil);
  const displayName = formatSubscriptionDisplayName(
    subscription.name,
    subscription.planName
  );
  const nextRenewalDateLabel = formatContractDateYmd(
    subscription.nextRenewalDate
  );
  const cardClassName = cn(
    SUBSCRIPTION_MOBILE_SIMPLE_ROW_CLASS,
    SUBSCRIPTION_MOBILE_SIMPLE_ROW_PADDING_CLASS,
    "min-h-[44px] rounded-[10px] bg-white py-2 text-[#111111]",
    onPress && MOBILE_PRESSABLE_CARD_CLASS,
    onPress && disabled && "pointer-events-none opacity-40",
    className
  );
  const cardContent = (
    <>
      <p className={SUBSCRIPTION_MOBILE_SIMPLE_NAME_CELL_CLASS}>{displayName}</p>
      <p className={SUBSCRIPTION_MOBILE_SIMPLE_AMOUNT_CELL_CLASS}>
        <SimplePrimaryBillingLine subscription={subscription} />
      </p>
      <p
        className={`${SUBSCRIPTION_MOBILE_SIMPLE_DATE_CELL_CLASS} whitespace-nowrap text-[12px] font-normal leading-tight`}
      >
        <span className={SUBSCRIPTION_MOBILE_SIMPLE_DATE_DOT_SLOT_CLASS} aria-hidden>
          {urgencyTier !== null ? (
            <span
              className="size-[10px] rounded-full"
              style={{
                backgroundColor: getMobileUpcomingRenewalDotColor(urgencyTier),
              }}
              data-upcoming-renewal-dot={urgencyTier}
            />
          ) : null}
        </span>
        <span>{nextRenewalDateLabel}</span>
      </p>
    </>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        aria-label={`${displayName} を${pressActionLabel}`}
        className={cn(cardClassName, "w-full border-0 text-left")}
      >
        {cardContent}
      </button>
    );
  }

  return <article className={cardClassName}>{cardContent}</article>;
}
