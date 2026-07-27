import type { ReactNode } from "react";
import { YenAmountDisplay } from "@/components/features/subscription/YenAmountDisplay";
import { PAYMENT_PLAN_LABELS } from "@/lib/subscription/constants";
import { formatContractDateYmd } from "@/lib/subscription/format";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LABEL_COLUMN_WIDTH_CLASS = "w-[7.5rem] min-w-[7.5rem] max-w-[7.5rem]";
const DATA_COLUMN_MIN_WIDTH_CLASS = "min-w-[8.75rem]";

export const SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM = 7.5;
export const SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM = 8.75;

/** サマリーカードの最小幅を決めるデータ列数（件数が少ないときもこの幅を下回らない） */
export const SUBSCRIPTION_SUMMARY_MIN_DATA_COLUMNS = 6;

export const SUBSCRIPTION_SUMMARY_MIN_WIDTH_CSS_VAR =
  "--subscription-summary-min-width";

export function getSubscriptionTableWidthRem(dataColumnCount: number): number {
  return (
    SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM +
    dataColumnCount * SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM
  );
}

export const SUBSCRIPTION_SUMMARY_MIN_TABLE_WIDTH_REM = getSubscriptionTableWidthRem(
  SUBSCRIPTION_SUMMARY_MIN_DATA_COLUMNS
);

/**
 * 削除列フェードアニメーション。
 * 差し戻し時は false にするだけで従来の即時削除に戻る。
 */
export const ENABLE_DELETE_COLUMN_ANIMATION = true;
export const DELETE_COLUMN_FADE_MS = 250;
export const DELETE_COLUMN_FADE_CLASS =
  "opacity-0 transition-opacity duration-[250ms] motion-reduce:transition-none";

const LABEL_ROW_BG_EVEN = "#A3A3A3";
const LABEL_ROW_BG_ODD = "#C9C9C9";

const HEADER_GRADIENT_START = { r: 249, g: 203, b: 142 };
const HEADER_GRADIENT_END = { r: 162, g: 240, b: 235 };

const ATTRIBUTE_LABELS = [
  "プラン",
  "支払いプラン",
  "月額",
  "年額",
  "契約日",
  "次回更新日",
  "お知らせ",
] as const;

type SubscriptionTableAction = "edit" | "delete";

function lerpChannel(start: number, end: number, t: number): number {
  return Math.round(start + (end - start) * t);
}

/** 列数に応じて start→end を補間したヘッダー背景色 */
export function subscriptionHeaderColor(
  index: number,
  count: number
): string {
  const t = count <= 1 ? 0 : index / (count - 1);
  const r = lerpChannel(
    HEADER_GRADIENT_START.r,
    HEADER_GRADIENT_END.r,
    t
  );
  const g = lerpChannel(
    HEADER_GRADIENT_START.g,
    HEADER_GRADIENT_END.g,
    t
  );
  const b = lerpChannel(
    HEADER_GRADIENT_START.b,
    HEADER_GRADIENT_END.b,
    t
  );
  return `rgb(${r}, ${g}, ${b})`;
}

function labelRowBackground(rowIndex: number): string {
  return rowIndex % 2 === 0 ? LABEL_ROW_BG_EVEN : LABEL_ROW_BG_ODD;
}

const CELL_BORDER_CLASS = "border border-white";

function StickyCornerCell() {
  return (
    <th
      scope="col"
      className={cn(
        LABEL_COLUMN_WIDTH_CLASS,
        "sticky left-0 z-30 border-r border-b border-white p-0"
      )}
      aria-hidden="true"
    />
  );
}

function StickyLabelCell({
  label,
  rowIndex,
}: {
  label: string;
  rowIndex: number;
}) {
  return (
    <th
      scope="row"
      className={cn(
        CELL_BORDER_CLASS,
        LABEL_COLUMN_WIDTH_CLASS,
        "sticky left-0 z-20 px-2 py-2 text-left text-sm font-bold text-black"
      )}
      style={{ backgroundColor: labelRowBackground(rowIndex) }}
    >
      {label}
    </th>
  );
}

function DataCell({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td
      className={cn(
        CELL_BORDER_CLASS,
        DATA_COLUMN_MIN_WIDTH_CLASS,
        "bg-black px-2 py-2 text-center text-sm text-white",
        className
      )}
      title={title}
    >
      {children}
    </td>
  );
}

function AttributeValueCells({
  row,
  attributeIndex,
  className,
}: {
  row: SavedSubscriptionRow;
  attributeIndex: number;
  className?: string;
}) {
  switch (attributeIndex) {
    case 0:
      return (
        <DataCell
          className={cn("max-w-40 truncate", className)}
          title={row.planName}
        >
          {row.planName}
        </DataCell>
      );
    case 1:
      return (
        <DataCell className={className}>
          {PAYMENT_PLAN_LABELS[row.paymentPlan]}
        </DataCell>
      );
    case 2:
      return (
        <DataCell className={cn("font-bold", className)}>
          <YenAmountDisplay amount={row.monthlyAmount} />
        </DataCell>
      );
    case 3:
      return (
        <DataCell className={cn("font-bold", className)}>
          <YenAmountDisplay amount={row.annualAmount} />
        </DataCell>
      );
    case 4:
      return (
        <DataCell className={className}>
          {formatContractDateYmd(row.contractDate)}
        </DataCell>
      );
    case 5:
      return (
        <DataCell className={className}>
          {formatContractDateYmd(row.nextRenewalDate)}
        </DataCell>
      );
    case 6:
      return (
        <DataCell className={className}>
          {row.notifyEnabled ? "ON" : "—"}
        </DataCell>
      );
    default:
      return <DataCell className={className}>—</DataCell>;
  }
}

type SubscriptionTransposeTableProps = {
  subscriptions: SavedSubscriptionRow[];
  action?: SubscriptionTableAction;
  onEdit?: (subscriptionId: string) => void;
  onDelete?: (subscriptionId: string) => void;
  /** フェードアウト中の列（削除アニメ用）。未指定時はアニメなし */
  removingSubscriptionId?: string | null;
};

export function SubscriptionTransposeTable({
  subscriptions,
  action,
  onEdit,
  onDelete,
  removingSubscriptionId = null,
}: SubscriptionTransposeTableProps) {
  if (subscriptions.length === 0) {
    return null;
  }

  const count = subscriptions.length;
  const actionLabel =
    action === "edit" ? "修正" : action === "delete" ? "削除" : null;
  const actionRowIndex = ATTRIBUTE_LABELS.length;
  const isRemovalInProgress = removingSubscriptionId !== null;

  return (
    <table className="w-max border-collapse">
      <thead>
        <tr>
          <StickyCornerCell />
          {subscriptions.map((row, index) => (
            <th
              key={row.id}
              scope="col"
              className={cn(
                CELL_BORDER_CLASS,
                DATA_COLUMN_MIN_WIDTH_CLASS,
                "max-w-40 px-2 py-2 text-center text-sm font-bold text-black",
                row.id === removingSubscriptionId && DELETE_COLUMN_FADE_CLASS
              )}
              style={{
                backgroundColor: subscriptionHeaderColor(index, count),
              }}
              title={row.name}
            >
              <span className="block truncate">{row.name}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ATTRIBUTE_LABELS.map((label, rowIndex) => (
          <tr key={label}>
            <StickyLabelCell label={label} rowIndex={rowIndex} />
            {subscriptions.map((row) => (
              <AttributeValueCells
                key={`${row.id}-${label}`}
                row={row}
                attributeIndex={rowIndex}
                className={
                  row.id === removingSubscriptionId
                    ? DELETE_COLUMN_FADE_CLASS
                    : undefined
                }
              />
            ))}
          </tr>
        ))}

        {actionLabel ? (
          <tr>
            <StickyLabelCell
              label={actionLabel}
              rowIndex={actionRowIndex}
            />
            {subscriptions.map((row) => (
              <DataCell
                key={`${row.id}-action`}
                className={
                  row.id === removingSubscriptionId
                    ? DELETE_COLUMN_FADE_CLASS
                    : undefined
                }
              >
                {action === "edit" && onEdit ? (
                  <Button
                    type="button"
                    onClick={() => onEdit(row.id)}
                    className="h-9 w-[72px] bg-[#8A2082] px-0 text-white hover:bg-[#74206E]"
                  >
                    修正
                  </Button>
                ) : null}
                {action === "delete" && onDelete ? (
                  <Button
                    type="button"
                    onClick={() => onDelete(row.id)}
                    disabled={isRemovalInProgress}
                    className="h-9 w-[72px] bg-[#9B1343] px-0 font-bold text-white hover:bg-[#851039]"
                  >
                    削除
                  </Button>
                ) : null}
              </DataCell>
            ))}
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
