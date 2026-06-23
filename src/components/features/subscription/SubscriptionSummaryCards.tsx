import { YenAmountDisplay } from "@/components/features/subscription/YenAmountDisplay";
import { computeSubscriptionSummary } from "@/lib/subscription/summary";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

type SubscriptionSummaryCardsProps = {
  subscriptions: SavedSubscriptionRow[];
};

type SummaryCardConfig = {
  label: string;
  backgroundColor: string;
  value: React.ReactNode;
};

function SummaryCard({ label, backgroundColor, value }: SummaryCardConfig) {
  return (
    <div
      className="flex size-[120px] items-center justify-center rounded-[10px] px-3 text-white"
      style={{ backgroundColor }}
    >
      <div className="flex w-full flex-col items-center gap-1 text-center">
        <p className="text-[18px] font-bold leading-tight">{label}</p>
        <div className="h-px w-full bg-white/80" aria-hidden="true" />
        <div className="flex items-center justify-center">{value}</div>
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
      backgroundColor: "#768A20",
      value: (
        <span className="text-[20px] font-bold leading-none">
          {summary.contractCount}
        </span>
      ),
    },
    {
      label: "月額合計",
      backgroundColor: "#208A73",
      value: <YenAmountDisplay amount={summary.monthlyTotal} variant="summary" />,
    },
    {
      label: "年額合計",
      backgroundColor: "#8A2082",
      value: <YenAmountDisplay amount={summary.annualTotal} variant="summary" />,
    },
  ];

  return (
    <div className="flex gap-5">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}
