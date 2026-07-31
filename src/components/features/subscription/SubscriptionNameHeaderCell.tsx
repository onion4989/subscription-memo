"use client";

import type { CSSProperties, RefCallback } from "react";
import { useCallback, useState, useSyncExternalStore } from "react";
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

type TableFrameVisibility = {
  isVisible: boolean;
  triggerRef: RefCallback<HTMLSpanElement>;
};

/**
 * 黒いテーブル枠内にトリガーが見えているとき isVisible が true。
 * 横スクロールで枠外に出た列の「更新間近」を出さない。
 * triggerRef が付いた要素が外れている間は観測しないため、
 * 呼び出し側は表示条件を満たすときだけ triggerRef を渡す。
 */
function useIsVisibleInTableFrame(): TableFrameVisibility {
  const [isVisible, setIsVisible] = useState(false);

  const triggerRef = useCallback((trigger: HTMLSpanElement | null) => {
    if (!trigger) {
      return;
    }

    const frame = trigger.closest(`[${SUBSCRIPTION_TABLE_FRAME_DATA_ATTR}]`);
    if (!(frame instanceof Element)) {
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
    return () => {
      observer.disconnect();
      setIsVisible(false);
    };
  }, []);

  return { isVisible, triggerRef };
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
  const { isVisible, triggerRef } = useIsVisibleInTableFrame();

  if (urgencyTier === null || !isMdUp) {
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
        <Tooltip open={isVisible} onOpenChange={() => undefined}>
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
