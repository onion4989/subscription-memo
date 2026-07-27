import {
  SUBSCRIPTION_SUMMARY_MIN_TABLE_WIDTH_REM,
  SUBSCRIPTION_SUMMARY_MIN_WIDTH_CSS_VAR,
  SubscriptionTransposeTable,
} from "@/components/features/subscription/subscription-table-shared";
import { SubscriptionSummaryCards } from "@/components/features/subscription/SubscriptionSummaryCards";
import { SUBSCRIPTION_TABLE_BLOCK_CLASS } from "@/components/features/subscription/SubscriptionTableSection";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";
import type { CSSProperties } from "react";

type SubscriptionListTableProps = {
  subscriptions: SavedSubscriptionRow[];
};

const summaryMinWidthStyle = {
  [SUBSCRIPTION_SUMMARY_MIN_WIDTH_CSS_VAR]: `${SUBSCRIPTION_SUMMARY_MIN_TABLE_WIDTH_REM}rem`,
} as CSSProperties;

export function SubscriptionListTable({
  subscriptions,
}: SubscriptionListTableProps) {
  return (
    <div className={`${SUBSCRIPTION_TABLE_BLOCK_CLASS} gap-8 md:gap-14`}>
      {/*
        inline-grid + w-max: サマリーとテーブルの広い方に列幅を揃える。
        サマリーは横スクロールなし。テーブルのみ overflow-x でスクロール。
        md 以上で最小幅（SUBSCRIPTION_SUMMARY_MIN_DATA_COLUMNS 列分）を確保。
      */}
      <div className="inline-grid w-max max-w-full grid-cols-1 gap-8 md:gap-14">
        <div
          className="w-full max-w-full md:min-w-(--subscription-summary-min-width)"
          style={summaryMinWidthStyle}
        >
          <SubscriptionSummaryCards subscriptions={subscriptions} />
        </div>

        <div className={APP_SCROLLBAR_X_CLASS}>
          <SubscriptionTransposeTable subscriptions={subscriptions} />
        </div>
      </div>
    </div>
  );
}
