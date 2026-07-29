"use client";

import type { CSSProperties } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  UPCOMING_RENEWAL_CELL_COLORS,
  type UpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";
import { cn } from "@/lib/utils";

const TOOLTIP_TEXT_COLORS: Record<UpcomingRenewalUrgencyTier, string> = {
  3: "#FFFFFF",
  5: "#000000",
};

const TOOLTIP_ARROW_CLASS: Record<UpcomingRenewalUrgencyTier, string> = {
  3: "bg-[#9F193B] fill-[#9F193B]",
  5: "bg-[#EDE466] fill-[#EDE466]",
};

type SubscriptionNameHeaderCellProps = {
  name: string;
  urgencyTier: UpcomingRenewalUrgencyTier | null;
  className?: string;
  style?: CSSProperties;
};

export function SubscriptionNameHeaderCell({
  name,
  urgencyTier,
  className,
  style,
}: SubscriptionNameHeaderCellProps) {
  if (urgencyTier === null) {
    return (
      <th scope="col" className={className} style={style} title={name}>
        {name}
      </th>
    );
  }

  const backgroundColor = UPCOMING_RENEWAL_CELL_COLORS[urgencyTier];

  return (
    <th scope="col" className={cn(className)} style={style} title={name}>
      <TooltipProvider>
        <Tooltip open onOpenChange={() => undefined}>
          <TooltipTrigger asChild>
            <span className="block truncate">{name}</span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={6}
            className="pointer-events-none border-0 px-2.5 py-1 text-xs !font-bold shadow-md"
            style={{
              backgroundColor,
              color: TOOLTIP_TEXT_COLORS[urgencyTier],
            }}
            arrowClassName={TOOLTIP_ARROW_CLASS[urgencyTier]}
          >
            更新間近
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </th>
  );
}
