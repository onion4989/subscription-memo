import {
  SUBSCRIPTION_LIST_TABLE_COLUMNS,
  SUBSCRIPTION_LIST_TABLE_GRID_CLASS,
  SubscriptionTableHeader,
  SubscriptionTableRow,
} from "@/components/features/subscription/subscription-table-shared";
import { SubscriptionSummaryCards } from "@/components/features/subscription/SubscriptionSummaryCards";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

type SubscriptionListTableProps = {
  subscriptions: SavedSubscriptionRow[];
};

export function SubscriptionListTable({
  subscriptions,
}: SubscriptionListTableProps) {
  return (
    <div className={APP_SCROLLBAR_X_CLASS}>
      <div className="mx-auto flex w-max flex-col items-center gap-4">
        <SubscriptionSummaryCards subscriptions={subscriptions} />

        <div className={SUBSCRIPTION_LIST_TABLE_GRID_CLASS}>
          <SubscriptionTableHeader columns={SUBSCRIPTION_LIST_TABLE_COLUMNS} />

          {subscriptions.map((row) => (
            <SubscriptionTableRow key={row.id} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
