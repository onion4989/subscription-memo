"use client";

import { cn } from "@/lib/utils";

export type SubscriptionViewMode = "simple" | "detail";

const VIEW_MODE_OPTIONS = [
  {
    mode: "simple" as const,
    label: "簡易表示",
    iconSrc: "/assets/subscription/view-simple.svg",
  },
  {
    mode: "detail" as const,
    label: "詳細表示",
    iconSrc: "/assets/subscription/view-detail.svg",
  },
] as const;

const SELECTED_BG = "#56A3AB";
const UNSELECTED_BG = "#616161";

type SubscriptionViewModeToggleProps = {
  mode: SubscriptionViewMode;
  onChange: (mode: SubscriptionViewMode) => void;
  className?: string;
};

export function SubscriptionViewModeToggle({
  mode,
  onChange,
  className,
}: SubscriptionViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="一覧の表示切替"
      className={cn("flex w-full gap-2", className)}
    >
      {VIEW_MODE_OPTIONS.map((option) => {
        const selected = mode === option.mode;

        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.mode)}
            className="flex h-[30px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[5px] px-2 text-[12px] font-bold text-white"
            style={{
              backgroundColor: selected ? SELECTED_BG : UNSELECTED_BG,
            }}
          >
            {/* Figma 由来の SVG。next/image はローカル SVG 非対応のため img を使用 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={option.iconSrc}
              alt=""
              width={18}
              height={18}
              className="size-[18px] shrink-0"
              aria-hidden
            />
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
