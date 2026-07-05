import {
  SUBSCRIPTION_LIST_TABLE_COLUMNS,
  SUBSCRIPTION_LIST_TABLE_GRID_CLASS,
  SubscriptionTableHeader,
  SubscriptionTableRow,
} from "@/components/features/subscription/subscription-table-shared";
import { SubscriptionSummaryCards } from "@/components/features/subscription/SubscriptionSummaryCards";
import {
  SUBSCRIPTION_TABLE_BLOCK_CLASS,
  SUBSCRIPTION_TABLE_CENTERED_ROW_CLASS,
  SUBSCRIPTION_TABLE_WIDTH_CONTAINER_CLASS,
} from "@/components/features/subscription/SubscriptionTableSection";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

type SubscriptionListTableProps = {
  subscriptions: SavedSubscriptionRow[];
};

export function SubscriptionListTable({
  subscriptions,
}: SubscriptionListTableProps) {
  return (
    <div className={`${SUBSCRIPTION_TABLE_BLOCK_CLASS} gap-8 md:gap-14`}>
      <div
        className={`${SUBSCRIPTION_TABLE_WIDTH_CONTAINER_CLASS} gap-8 md:gap-14`}
      >
        <div className={SUBSCRIPTION_TABLE_CENTERED_ROW_CLASS}>
          <SubscriptionSummaryCards subscriptions={subscriptions} />
        </div>

        <div className={APP_SCROLLBAR_X_CLASS}>
          <div className={SUBSCRIPTION_LIST_TABLE_GRID_CLASS}>
            <SubscriptionTableHeader columns={SUBSCRIPTION_LIST_TABLE_COLUMNS} />

            {subscriptions.map((row) => (
              <SubscriptionTableRow key={row.id} row={row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
