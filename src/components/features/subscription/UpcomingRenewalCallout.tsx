import {
  UPCOMING_RENEWAL_CELL_COLORS,
  UPCOMING_RENEWAL_LABEL_TEXT_COLORS,
  type UpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";
import { cn } from "@/lib/utils";

/** デスクトップ Tooltip / モバイル吹き出しで共有する本体スタイル */
export const UPCOMING_RENEWAL_CALLOUT_CONTENT_CLASS =
  "pointer-events-none border-0 px-2.5 py-1 text-xs font-bold shadow-md rounded-md";

/** Radix Tooltip Arrow 用（fill 付き） */
export const UPCOMING_RENEWAL_CALLOUT_ARROW_CLASS: Record<
  UpcomingRenewalUrgencyTier,
  string
> = {
  3: "bg-[#9F193B] fill-[#9F193B]",
  5: "bg-[#EDE466] fill-[#EDE466]",
};

type UpcomingRenewalCalloutProps = {
  urgencyTier: UpcomingRenewalUrgencyTier;
  className?: string;
};

/**
 * デスクトップの「更新間近」Tooltip と同デザインの静的吹き出し。
 * 本体レクタングルの縦中央を Card 上辺に合わせ、矢印は Card 内側へ。
 */
export function UpcomingRenewalCallout({
  urgencyTier,
  className,
}: UpcomingRenewalCalloutProps) {
  const backgroundColor = UPCOMING_RENEWAL_CELL_COLORS[urgencyTier];

  return (
    <span
      className={cn(
        "pointer-events-none absolute right-[10px] top-0 z-10 -translate-y-1/2",
        className
      )}
      data-upcoming-renewal-badge={urgencyTier}
    >
      <span
        className={cn(UPCOMING_RENEWAL_CALLOUT_CONTENT_CLASS, "relative block")}
        style={{
          backgroundColor,
          color: UPCOMING_RENEWAL_LABEL_TEXT_COLORS[urgencyTier],
        }}
      >
        更新間近
        {/* absolute のためラッパー高さは本体のみ → -translate-y-1/2 がレクタングル中央基準 */}
        <span
          aria-hidden
          className="absolute left-1/2 top-full z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px]"
          style={{ backgroundColor }}
        />
      </span>
    </span>
  );
}
