"use client";

import type { CSSProperties, RefObject } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SUBSCRIPTION_TABLE_FRAME_DATA_ATTR } from "@/components/features/subscription/SubscriptionTableSection";
import {
  UPCOMING_RENEWAL_CALLOUT_ARROW_CLASS,
  UPCOMING_RENEWAL_CALLOUT_CONTENT_CLASS,
} from "@/components/features/subscription/UpcomingRenewalCallout";
import {
  UPCOMING_RENEWAL_CELL_COLORS,
  UPCOMING_RENEWAL_LABEL_TEXT_COLORS,
  type UpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";
import { cn } from "@/lib/utils";

const MD_UP_MEDIA_QUERY = "(min-width: 768px)";

/** サブピクセル誤差を吸収しつつ、ほぼ全体が見えているときだけ表示 */
const VISIBLE_INTERSECTION_RATIO = 0.99;

function subscribeMdUp(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MD_UP_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMdUpSnapshot(): boolean {
  return window.matchMedia(MD_UP_MEDIA_QUERY).matches;
}

/** SSR / 初回は false。モバイルで hidden テーブルの Tooltip が Portal 漏れしないようにする */
function useIsMdUp(): boolean {
  return useSyncExternalStore(subscribeMdUp, getMdUpSnapshot, () => false);
}

/**
 * 黒いテーブル枠内にトリガーが見えているとき true。
 * 横スクロールで枠外に出た列の「更新間近」を出さない。
 */
function useIsVisibleInTableFrame(
  triggerRef: RefObject<HTMLElement | null>,
  enabled: boolean
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(false);
      return;
    }

    const trigger = triggerRef.current;
    if (!trigger) {
      setIsVisible(false);
      return;
    }

    const frame = trigger.closest(`[${SUBSCRIPTION_TABLE_FRAME_DATA_ATTR}]`);
    if (!(frame instanceof Element)) {
      setIsVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          setIsVisible(false);
          return;
        }
        setIsVisible(
          entry.isIntersecting &&
            entry.intersectionRatio >= VISIBLE_INTERSECTION_RATIO
        );
      },
      {
        root: frame,
        threshold: [0, 0.5, VISIBLE_INTERSECTION_RATIO, 1],
      }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [enabled, triggerRef]);

  return isVisible;
}

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
  const isMdUp = useIsMdUp();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const shouldTrackVisibility = isMdUp && urgencyTier !== null;
  const isVisibleInFrame = useIsVisibleInTableFrame(
    triggerRef,
    shouldTrackVisibility
  );

  if (urgencyTier === null || !isMdUp) {
    return (
      <th scope="col" className={className} style={style} title={name}>
        {name}
      </th>
    );
  }

  const backgroundColor = UPCOMING_RENEWAL_CELL_COLORS[urgencyTier];
  const showTooltip = isVisibleInFrame;

  return (
    <th scope="col" className={cn(className)} style={style} title={name}>
      <TooltipProvider>
        <Tooltip open={showTooltip} onOpenChange={() => undefined}>
          <TooltipTrigger asChild>
            <span ref={triggerRef} className="block truncate">
              {name}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={6}
            className={cn(
              UPCOMING_RENEWAL_CALLOUT_CONTENT_CLASS,
              "!font-bold"
            )}
            style={{
              backgroundColor,
              color: UPCOMING_RENEWAL_LABEL_TEXT_COLORS[urgencyTier],
            }}
            arrowClassName={UPCOMING_RENEWAL_CALLOUT_ARROW_CLASS[urgencyTier]}
          >
            更新間近
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </th>
  );
}
