import { SubscriptionTransposeTable } from "@/components/features/subscription/subscription-table-shared";
import { SubscriptionMobileList } from "@/components/features/subscription/SubscriptionMobileList";
import { SubscriptionRenewalNotice } from "@/components/features/subscription/SubscriptionRenewalNotice";
import { SubscriptionSummaryCards } from "@/components/features/subscription/SubscriptionSummaryCards";
import {
  SUBSCRIPTION_TABLE_BLOCK_CLASS,
  SUBSCRIPTION_TABLE_FRAME_DATA_ATTR,
  SUBSCRIPTION_TABLE_SCROLL_AREA_CLASS,
  SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS,
} from "@/components/features/subscription/SubscriptionTableSection";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type SubscriptionListTableProps = {
  subscriptions: SavedSubscriptionRow[];
};

export function SubscriptionListTable({
  subscriptions,
}: SubscriptionListTableProps) {
  return (
    <div className={`${SUBSCRIPTION_TABLE_BLOCK_CLASS} w-full gap-8 md:gap-14`}>
      <div className="w-full space-y-6 md:hidden">
        <SubscriptionSummaryCards subscriptions={subscriptions} />
        <div>
          <SubscriptionRenewalNotice subscriptions={subscriptions} />
          <SubscriptionMobileList subscriptions={subscriptions} />
        </div>
      </div>

      <div className="hidden w-full flex-col gap-8 md:flex md:gap-14">
        <SubscriptionSummaryCards subscriptions={subscriptions} />
        <SubscriptionRenewalNotice subscriptions={subscriptions} />

        <div
          className={cn(
            SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS,
            "flex items-center justify-center"
          )}
          {...{ [SUBSCRIPTION_TABLE_FRAME_DATA_ATTR]: "" }}
        >
          <div
            className={cn(
              APP_SCROLLBAR_X_CLASS,
              SUBSCRIPTION_TABLE_SCROLL_AREA_CLASS
            )}
          >
            <SubscriptionTransposeTable subscriptions={subscriptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
