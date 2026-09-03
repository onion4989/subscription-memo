import { YenAmountDisplay } from "@/components/features/subscription/YenAmountDisplay";
import { computeSubscriptionSummary } from "@/lib/subscription/summary";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { cn } from "@/lib/utils";

/** モバイルピル: ラベル列の固定幅（最長ラベル「月額合計」「年額合計」に合わせる） */
const SUMMARY_CARD_LABEL_COLUMN_CLASS = "w-[5.5rem] shrink-0";

/** 旧 120px 正方形カード（md:px-3）時の横線幅を維持 */
const SUMMARY_CARD_DESKTOP_DIV_CLASS = "md:w-[96px]";

const SUMMARY_CARDS_DESKTOP_GAP_CLASS = "md:gap-[30px]";

type SubscriptionSummaryCardsProps = {
  subscriptions: SavedSubscriptionRow[];
};

type SummaryCardConfig = {
  label: string;
  backgroundVar: string;
  foregroundVar: string;
  value: React.ReactNode;
};

function SummaryCard({
  label,
  backgroundVar,
  foregroundVar,
  value,
}: SummaryCardConfig) {
  return (
    <div
      className={cn(
        "w-full border-2 border-white",
        "grid grid-cols-[5.5rem_auto_1fr] items-center gap-x-3 rounded-[5px] px-5 py-3",
        "md:flex md:min-h-[120px] md:flex-col md:items-center md:justify-center md:gap-2 md:rounded-[10px] md:px-3 md:py-4"
      )}
      style={{
        backgroundColor: `var(${backgroundVar})`,
        color: `var(${foregroundVar})`,
      }}
    >
      <p
        className={cn(
          SUMMARY_CARD_LABEL_COLUMN_CLASS,
          "text-[14px] font-bold leading-tight md:w-auto md:text-center md:text-[18px]"
        )}
      >
        {label}
      </p>
      <div
        className={cn(
          "h-5 w-px shrink-0 bg-current/80",
          "md:h-px",
          SUMMARY_CARD_DESKTOP_DIV_CLASS
        )}
        aria-hidden="true"
      />
      <div className="flex items-center justify-start text-left md:justify-center">
        {value}
      </div>
    </div>
  );
}

export function SubscriptionSummaryCards({
  subscriptions,
}: SubscriptionSummaryCardsProps) {
  const summary = computeSubscriptionSummary(subscriptions);

  const cards: SummaryCardConfig[] = [
    {
      label: "契約数",
      backgroundVar: "--app-summary-1",
      foregroundVar: "--app-summary-fg-1",
      value: (
        <span className="text-[16px] font-bold leading-none md:text-[20px]">
          {summary.contractCount}
        </span>
      ),
    },
    {
      label: "月額合計",
      backgroundVar: "--app-summary-2",
      foregroundVar: "--app-summary-fg-2",
      value: <YenAmountDisplay amount={summary.monthlyTotal} variant="summary" />,
    },
    {
      label: "年額合計",
      backgroundVar: "--app-summary-3",
      foregroundVar: "--app-summary-fg-3",
      value: <YenAmountDisplay amount={summary.annualTotal} variant="summary" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3",
        "md:grid md:grid-cols-3",
        SUMMARY_CARDS_DESKTOP_GAP_CLASS
      )}
    >
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}
