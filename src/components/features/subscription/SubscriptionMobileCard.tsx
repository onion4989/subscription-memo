import { Button } from "@/components/ui/button";
import { formatContractDateYmd } from "@/lib/subscription/format";
import {
  daysBetweenYmd,
  todayYmdInJst,
} from "@/lib/subscription/renewal-date";
import {
  getUpcomingRenewalUrgencyTier,
  UPCOMING_RENEWAL_CELL_COLORS,
  UPCOMING_RENEWAL_LABEL_TEXT_COLORS,
} from "@/lib/subscription/renewal-upcoming-notice";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { UpcomingRenewalCallout } from "@/components/features/subscription/UpcomingRenewalCallout";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const CARD_AMOUNT_CLASS = "text-[16px] font-bold";
const CARD_ANNUAL_LABEL_CLASS = "text-[12px] font-normal";
const CARD_ANNUAL_AMOUNT_CLASS = "text-[14px] font-bold";
const CARD_DETAIL_ROW_CLASS = "py-[5px] leading-tight";

type SubscriptionMobileCardAction = {
  label: "削除" | "修正";
  onClick: () => void;
  disabled?: boolean;
};

type SubscriptionMobileCardProps = {
  subscription: SavedSubscriptionRow;
  action?: SubscriptionMobileCardAction;
  className?: string;
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

  if (subscription.annualAmount === null) {
    return (
      <>
        <YenAmountText amount={subscription.monthlyAmount} />
        /月
      </>
    );
  }

  return (
    <>
      <YenAmountText amount={subscription.monthlyAmount} />
      /月
      <span className={CARD_ANNUAL_LABEL_CLASS}>
        （年換算：
        <YenAmountText
          amount={subscription.annualAmount}
          className={CARD_ANNUAL_AMOUNT_CLASS}
        />
        ）
      </span>
    </>
  );
}

function paymentPlanLabelForCard(subscription: SavedSubscriptionRow): string {
  return subscription.paymentPlan === "MONTHLY"
    ? "月額プラン"
    : "年額プラン（年額払い）";
}

export function SubscriptionMobileCard({
  subscription,
  action,
  className,
}: SubscriptionMobileCardProps) {
  const daysUntil = daysBetweenYmd(
    todayYmdInJst(),
    subscription.nextRenewalDate
  );
  const urgencyTier = getUpcomingRenewalUrgencyTier(daysUntil);
  const nextRenewalDateLabel = formatContractDateYmd(
    subscription.nextRenewalDate
  );

  return (
    <article
      className={cn(
        "relative rounded-[10px] bg-white px-4 py-5 text-[14px] leading-tight text-[#111111]",
        className
      )}
    >
      {urgencyTier !== null ? (
        <UpcomingRenewalCallout urgencyTier={urgencyTier} />
      ) : null}

      <header className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[20px] font-bold leading-tight">
            {`${subscription.name} ${subscription.planName}`}
          </h3>
          <p className="shrink-0 text-[14px] leading-tight">
            お知らせ：
            <span className="text-[#9B1343]">
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
        <p className={cn(CARD_DETAIL_ROW_CLASS, "whitespace-nowrap")}>
          料　　　金：
          <CardBillingLine subscription={subscription} />
        </p>
        <p className={CARD_DETAIL_ROW_CLASS}>
          次回更新日：
          {urgencyTier !== null ? (
            <span
              className="inline-block rounded-[2px] px-[5px] py-[3px] font-bold"
              style={{
                backgroundColor: UPCOMING_RENEWAL_CELL_COLORS[urgencyTier],
                color: UPCOMING_RENEWAL_LABEL_TEXT_COLORS[urgencyTier],
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

      {action ? (
        <div className="mt-3">
          <Button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "h-10 w-full px-0 text-[14px] font-bold text-white",
              action.label === "削除"
                ? "bg-[#9B1343] hover:bg-[#851039]"
                : "bg-[#8A2082] hover:bg-[#74206E]"
            )}
          >
            {action.label}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
