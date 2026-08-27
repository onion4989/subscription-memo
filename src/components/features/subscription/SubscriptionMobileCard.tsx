import { Button } from "@/components/ui/button";
import { formatContractDateYmd } from "@/lib/subscription/format";
import {
  daysBetweenYmd,
  todayYmdInJst,
} from "@/lib/subscription/renewal-date";
import { getUpcomingRenewalUrgencyTier } from "@/lib/subscription/renewal-upcoming-notice";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { UpcomingRenewalCallout } from "@/components/features/subscription/UpcomingRenewalCallout";
import {
  getMobileUpcomingRenewalHighlightColors,
  MOBILE_NOTIFY_OFF_COLOR,
  MOBILE_NOTIFY_ON_COLOR,
  MOBILE_PRESSABLE_CARD_CLASS,
} from "@/components/features/subscription/subscription-mobile-colors";
import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

const CARD_AMOUNT_CLASS = "text-[16px] font-bold";
const CARD_ANNUAL_LABEL_CLASS = "text-[12px] font-normal";
const CARD_ANNUAL_AMOUNT_CLASS = "text-[14px] font-bold";
const CARD_DETAIL_ROW_CLASS = "py-[5px] leading-tight";

type SubscriptionMobileCardAction = {
  label: "削除" | "修正";
  onClick: () => void;
  disabled?: boolean;
};

type SubscriptionMobilePressActionLabel = "修正" | "削除";

type SubscriptionMobileCardProps = {
  subscription: SavedSubscriptionRow;
  action?: SubscriptionMobileCardAction;
  className?: string;
  onPress?: () => void;
  pressActionLabel?: SubscriptionMobilePressActionLabel;
  disabled?: boolean;
};

function formatYenWithMark(amount: number | null): string {
  if (amount === null) {
    return "—";
  }

  return `￥${amount.toLocaleString("ja-JP")}`;
}

function YenAmountText({
  amount,
  className = CARD_AMOUNT_CLASS,
}: {
  amount: number | null;
  className?: string;
}) {
  return <span className={className}>{formatYenWithMark(amount)}</span>;
}

function CardBillingLine({
  subscription,
}: {
  subscription: SavedSubscriptionRow;
}): ReactNode {
  if (subscription.monthlyAmount === null) {
    return <YenAmountText amount={subscription.annualAmount} />;
  }

  return (
    <>
      <span className="block whitespace-nowrap">
        <YenAmountText amount={subscription.monthlyAmount} />
        /月
      </span>
      {subscription.annualAmount !== null ? (
        <span
          className={cn(CARD_ANNUAL_LABEL_CLASS, "block whitespace-nowrap")}
        >
          （年換算：
          <YenAmountText
            amount={subscription.annualAmount}
            className={CARD_ANNUAL_AMOUNT_CLASS}
          />
          ）
        </span>
      ) : null}
    </>
  );
}

function paymentPlanLabelForCard(subscription: SavedSubscriptionRow): string {
  return subscription.paymentPlan === "MONTHLY"
    ? "月額プラン"
    : "年額プラン（年額払い）";
}

function SubscriptionMobileCardContent({
  subscription,
  TitleTag,
}: {
  subscription: SavedSubscriptionRow;
  TitleTag: ElementType;
}) {
  const daysUntil = daysBetweenYmd(
    todayYmdInJst(),
    subscription.nextRenewalDate
  );
  const urgencyTier = getUpcomingRenewalUrgencyTier(daysUntil);
  const nextRenewalDateLabel = formatContractDateYmd(
    subscription.nextRenewalDate
  );
  const upcomingHighlightColors =
    urgencyTier !== null
      ? getMobileUpcomingRenewalHighlightColors(urgencyTier)
      : null;
  const displayName = `${subscription.name} ${subscription.planName}`;

  return (
    <>
      {urgencyTier !== null && upcomingHighlightColors !== null ? (
        <UpcomingRenewalCallout
          urgencyTier={urgencyTier}
          backgroundColor={upcomingHighlightColors.backgroundColor}
          textColor={upcomingHighlightColors.color}
        />
      ) : null}

      <header className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <TitleTag className="text-[16px] font-bold leading-tight">
            {displayName}
          </TitleTag>
          <p className="shrink-0 text-[14px] leading-tight">
            お知らせ：
            <span
              className="font-bold"
              style={{
                color: subscription.notifyEnabled
                  ? MOBILE_NOTIFY_ON_COLOR
                  : MOBILE_NOTIFY_OFF_COLOR,
              }}
            >
              {subscription.notifyEnabled ? "ON" : "OFF"}
            </span>
          </p>
        </div>
        <p className="font-bold leading-tight">
          {paymentPlanLabelForCard(subscription)}
        </p>
      </header>

      <hr className="my-2 border-[#111111]" />

      <div className="leading-tight">
        <p className={cn(CARD_DETAIL_ROW_CLASS, "flex")}>
          <span className="shrink-0">料　　　金：</span>
          <span className="min-w-0">
            <CardBillingLine subscription={subscription} />
          </span>
        </p>
        <p className={CARD_DETAIL_ROW_CLASS}>
          次回更新日：
          {urgencyTier !== null && upcomingHighlightColors !== null ? (
            <span
              className="inline-block rounded-[2px] px-[5px] py-[3px] font-bold"
              style={{
                backgroundColor: upcomingHighlightColors.backgroundColor,
                color: upcomingHighlightColors.color,
              }}
              data-upcoming-renewal-date={urgencyTier}
            >
              {nextRenewalDateLabel}
            </span>
          ) : (
            nextRenewalDateLabel
          )}
        </p>
        <p className={CARD_DETAIL_ROW_CLASS}>
          契　約　日：
          {formatContractDateYmd(subscription.contractDate)}
        </p>
      </div>
    </>
  );
}

export function SubscriptionMobileCard({
  subscription,
  action,
  className,
  onPress,
  pressActionLabel = "修正",
  disabled = false,
}: SubscriptionMobileCardProps) {
  const displayName = `${subscription.name} ${subscription.planName}`;
  const cardClassName = cn(
    "relative w-full rounded-[10px] bg-white px-[10px] py-5 text-[14px] leading-tight text-[#111111]",
    onPress && MOBILE_PRESSABLE_CARD_CLASS,
    onPress && disabled && "pointer-events-none opacity-40",
    className
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        aria-label={`${displayName} を${pressActionLabel}`}
        className={cn(cardClassName, "border-0 text-left")}
      >
        <SubscriptionMobileCardContent
          subscription={subscription}
          TitleTag="div"
        />
      </button>
    );
  }

  return (
    <article className={cardClassName}>
      <SubscriptionMobileCardContent subscription={subscription} TitleTag="h3" />

      {action ? (
        <div className="mt-3">
          <Button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "h-10 w-full px-0 text-[14px] font-bold text-white",
              action.label === "削除"
                ? "bg-[var(--app-action-danger)] hover:bg-[var(--app-action-danger-hover)]"
                : "bg-[var(--app-action-primary)] hover:bg-[var(--app-action-primary-hover)]"
            )}
          >
            {action.label}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
