import { YenAmountDisplay } from "@/components/features/subscription/YenAmountDisplay";
import { PAYMENT_PLAN_LABELS } from "@/lib/subscription/constants";
import { formatContractDateYmd } from "@/lib/subscription/format";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SUBSCRIPTION_LIST_TABLE_GRID_CLASS =
  "grid w-max grid-cols-[160px_80px_110px_70px_88px_100px_100px_64px] gap-x-2 gap-y-3";

export const SUBSCRIPTION_REGISTER_TABLE_GRID_CLASS =
  "grid w-max min-w-full grid-cols-[160px_80px_110px_70px_88px_100px_100px_64px_80px] gap-x-2 gap-y-3";

export const SUBSCRIPTION_DELETE_TABLE_GRID_CLASS =
  "grid w-max min-w-full grid-cols-[160px_80px_110px_70px_88px_100px_100px_64px_100px] gap-x-2 gap-y-3";

export const SUBSCRIPTION_LIST_TABLE_COLUMNS = [
  { label: "サブスクリプション名", centered: false },
  { label: "プラン名", centered: false },
  { label: "支払いプラン", centered: true },
  { label: "月額", centered: true },
  { label: "年額", centered: true },
  { label: "契約日", centered: true },
  { label: "次回更新日", centered: true },
  { label: "お知らせ", centered: true },
] as const;

export const SUBSCRIPTION_REGISTER_TABLE_COLUMNS = [
  ...SUBSCRIPTION_LIST_TABLE_COLUMNS,
  { label: "修正", centered: true },
] as const;

export const SUBSCRIPTION_DELETE_TABLE_COLUMNS = [
  ...SUBSCRIPTION_LIST_TABLE_COLUMNS,
  { label: "削除", centered: true },
] as const;

export function SubscriptionTableHeader({
  columns,
}: {
  columns: readonly { label: string; centered: boolean }[];
}) {
  return (
    <>
      {columns.map((column) => (
        <div
          key={column.label}
          className={cn(
            "px-1 text-sm font-semibold text-white",
            column.centered && "text-center"
          )}
        >
          {column.label}
        </div>
      ))}
      <div className="col-span-full h-px bg-white" aria-hidden="true" />
    </>
  );
}

function SavedCell({
  children,
  truncate = false,
  centered = false,
}: {
  children: React.ReactNode;
  truncate?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-9 min-w-0 items-center px-1 text-sm text-white",
        centered ? "justify-center text-center" : "",
        truncate && "truncate"
      )}
      title={truncate && typeof children === "string" ? children : undefined}
    >
      {children}
    </div>
  );
}

export function SubscriptionTableRow({
  row,
  onEdit,
  onDelete,
}: {
  row: SavedSubscriptionRow;
  onEdit?: (subscriptionId: string) => void;
  onDelete?: (subscriptionId: string) => void;
}) {
  return (
    <>
      <SavedCell>{row.name}</SavedCell>
      <SavedCell truncate>{row.planName}</SavedCell>
      <SavedCell centered>{PAYMENT_PLAN_LABELS[row.paymentPlan]}</SavedCell>
      <SavedCell centered>
        <YenAmountDisplay amount={row.monthlyAmount} />
      </SavedCell>
      <SavedCell centered>
        <YenAmountDisplay amount={row.annualAmount} />
      </SavedCell>
      <SavedCell centered truncate>
        {formatContractDateYmd(row.contractDate)}
      </SavedCell>
      <SavedCell centered truncate>
        {formatContractDateYmd(row.nextRenewalDate)}
      </SavedCell>
      <SavedCell centered>{row.notifyEnabled ? "ON" : "—"}</SavedCell>
      {onEdit ? (
        <div className="flex min-h-9 items-center justify-center px-1">
          <Button
            type="button"
            onClick={() => onEdit(row.id)}
            className="h-9 w-[72px] bg-[#8A2082] px-0 text-white hover:bg-[#74206E]"
          >
            修正
          </Button>
        </div>
      ) : null}
      {onDelete ? (
        <div className="flex min-h-9 items-center justify-center px-1">
          <Button
            type="button"
            onClick={() => onDelete(row.id)}
            className="h-9 w-[88px] bg-[#9B1343] px-0 font-bold text-white hover:bg-[#851039]"
          >
            削除する
          </Button>
        </div>
      ) : null}
    </>
  );
}
