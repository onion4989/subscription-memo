"use client";

import { useState } from "react";
import { SubscriptionMobileCard } from "@/components/features/subscription/SubscriptionMobileCard";
import {
  MOBILE_SIMPLE_AMT_HDR_CLASS,
  MOBILE_SIMPLE_DATE_DOT_CLASS,
  MOBILE_SIMPLE_DATE_HDR_CLASS,
  MOBILE_SIMPLE_DATE_TEXT_CLASS,
  MOBILE_SIMPLE_NAME_HDR_CLASS,
  MOBILE_SIMPLE_ROW_CLASS,
  MOBILE_SIMPLE_ROW_PAD_CLASS,
  SubscriptionMobileSimpleCard,
  type SubscriptionMobilePressActionLabel,
} from "@/components/features/subscription/SubscriptionMobileSimpleCard";
import {
  SubscriptionViewModeToggle,
  type SubscriptionViewMode,
} from "@/components/features/subscription/SubscriptionViewModeToggle";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

type SubscriptionMobileListProps = {
  subscriptions: SavedSubscriptionRow[];
  guideText?: string;
  onCardPress?: (subscriptionId: string) => void;
  pressActionLabel?: SubscriptionMobilePressActionLabel;
  cardDisabled?: boolean;
  getCardClassName?: (subscriptionId: string) => string | undefined;
};

const SIMPLE_COLUMN_HEADERS = [
  "サブスクリプション名",
  "金額",
  "次回更新日",
] as const;

export function SubscriptionMobileList({
  subscriptions,
  guideText,
  onCardPress,
  pressActionLabel = "修正",
  cardDisabled = false,
  getCardClassName,
}: SubscriptionMobileListProps) {
  const [viewMode, setViewMode] = useState<SubscriptionViewMode>("simple");

  return (
    <div className="w-full">
      {guideText ? (
        <p className="text-[14px] leading-normal text-[color:var(--app-fg)]/90">
          {guideText}
        </p>
      ) : null}

      <div className="my-[30px]">
        <SubscriptionViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "simple" ? (
        <div className="w-full">
          <div
            className={`${MOBILE_SIMPLE_ROW_CLASS} ${MOBILE_SIMPLE_ROW_PAD_CLASS} text-[12px] font-bold text-white`}
          >
            <span className={MOBILE_SIMPLE_NAME_HDR_CLASS}>
              {SIMPLE_COLUMN_HEADERS[0]}
            </span>
            <span className={MOBILE_SIMPLE_AMT_HDR_CLASS}>
              {SIMPLE_COLUMN_HEADERS[1]}
            </span>
            <span className={MOBILE_SIMPLE_DATE_HDR_CLASS}>
              <span
                className={MOBILE_SIMPLE_DATE_DOT_CLASS}
                aria-hidden
              />
              <span className={MOBILE_SIMPLE_DATE_TEXT_CLASS}>
                {SIMPLE_COLUMN_HEADERS[2]}
              </span>
            </span>
          </div>
          <div className="mt-[15px] space-y-[15px]">
            {subscriptions.map((subscription) => (
              <SubscriptionMobileSimpleCard
                key={subscription.id}
                subscription={subscription}
                className={getCardClassName?.(subscription.id)}
                pressActionLabel={pressActionLabel}
                disabled={cardDisabled}
                onPress={
                  onCardPress
                    ? () => onCardPress(subscription.id)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-[30px]">
          {subscriptions.map((subscription) => (
            <SubscriptionMobileCard
              key={subscription.id}
              subscription={subscription}
              className={getCardClassName?.(subscription.id)}
              pressActionLabel={pressActionLabel}
              disabled={cardDisabled}
              onPress={
                onCardPress ? () => onCardPress(subscription.id) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
