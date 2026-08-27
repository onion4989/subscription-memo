import {
  UPCOMING_RENEWAL_CELL_COLORS,
  UPCOMING_RENEWAL_LABEL_TEXT_COLORS,
  type UpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";
import { cn } from "@/lib/utils";

/** デスクトップ / モバイル吹き出しで共有する本体スタイル */
export const UPCOMING_RENEWAL_CALLOUT_CONTENT_CLASS =
  "pointer-events-none border-0 px-2.5 py-1 text-xs font-bold shadow-md rounded-md";

type UpcomingRenewalCalloutPlacement = "card" | "tableHeader";

type UpcomingRenewalCalloutProps = {
  urgencyTier: UpcomingRenewalUrgencyTier;
  className?: string;
  /** card: モバイルカード右上 / tableHeader: テーブル列ヘッダー中央上 */
  placement?: UpcomingRenewalCalloutPlacement;
  backgroundColor?: string;
  textColor?: string;
};

const PLACEMENT_CLASS: Record<UpcomingRenewalCalloutPlacement, string> = {
  card: "pointer-events-none absolute right-[10px] top-0 z-10 -translate-y-1/2",
  /** 本体＋矢印がヘッダー上辺と交わらないよう 12px 上げる。スクロール領域の pt 内に収める */
  tableHeader:
    "pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2",
};

/**
 * 「更新間近」静的吹き出し。
 * テーブル側は Portal せず absolute 配置し、サイドバー幅変化でも位置が追従する。
 */
export function UpcomingRenewalCallout({
  urgencyTier,
  className,
  placement = "card",
  backgroundColor = UPCOMING_RENEWAL_CELL_COLORS[urgencyTier],
  textColor = UPCOMING_RENEWAL_LABEL_TEXT_COLORS[urgencyTier],
}: UpcomingRenewalCalloutProps) {
  return (
    <span
      className={cn(PLACEMENT_CLASS[placement], className)}
      data-upcoming-renewal-badge={urgencyTier}
    >
      <span
        className={cn(UPCOMING_RENEWAL_CALLOUT_CONTENT_CLASS, "relative block")}
        style={{
          backgroundColor,
          color: textColor,
        }}
      >
        更新間近
        {/* absolute のためラッパー高さは本体のみ → 矢印は本体下辺基準 */}
        <span
          aria-hidden
          className="absolute left-1/2 top-full z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px]"
          style={{ backgroundColor }}
        />
      </span>
    </span>
  );
}
