"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  getContentEndPaddingPx,
  measureSubTableColumnWidthPx,
  snapScrollLeftToColumn,
} from "@/lib/subscription/subscription-table-scroll-snap";
import { cn } from "@/lib/utils";

type SubscriptionTableScrollAreaProps = {
  children: ReactNode;
  className?: string;
};

const SCROLL_END_FALLBACK_MS = 80;
/** プログラム吸着後の scrollend を無視する時間 */
const SNAP_IGNORE_MS = 50;
const EDGE_EPSILON_PX = 0.5;

/**
 * テーブル横スクロール領域。
 * ネイティブ横バー + 列幅単位の吸着。
 * 枠線用 gutter はテーブル幅のみ（スクロール padding には含めない）。
 */
export function SubscriptionTableScrollArea({
  children,
  className,
}: SubscriptionTableScrollAreaProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Browser API: 列幅計測・末尾パディング・scrollend 吸着
  useEffect(() => {
    const area = areaRef.current;
    const content = contentRef.current;
    if (!area || !content) {
      return;
    }

    let ignoreScrollEnd = false;
    let fallbackTimer = 0;
    let ignoreTimer = 0;

    const readCurrentPadPx = (): number => {
      const raw = content.style.paddingRight;
      if (!raw) {
        return 0;
      }
      const parsed = Number.parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const syncEndPadding = () => {
      const colPx = measureSubTableColumnWidthPx(area);
      const currentPad = readCurrentPadPx();
      const maxWithPad = area.scrollWidth - area.clientWidth;
      const maxNatural = Math.max(0, maxWithPad - currentPad);
      const padPx = getContentEndPaddingPx(maxNatural, colPx);
      if (Math.abs(currentPad - padPx) < EDGE_EPSILON_PX) {
        return;
      }
      content.style.paddingRight = `${padPx}px`;
    };

    const snapToColumn = () => {
      if (ignoreScrollEnd) {
        return;
      }
      const colPx = measureSubTableColumnWidthPx(area);
      const maxLeft = area.scrollWidth - area.clientWidth;
      const nextLeft = snapScrollLeftToColumn(
        area.scrollLeft,
        colPx,
        maxLeft
      );
      if (Math.abs(area.scrollLeft - nextLeft) < EDGE_EPSILON_PX) {
        return;
      }
      ignoreScrollEnd = true;
      window.clearTimeout(ignoreTimer);
      area.scrollTo({ left: nextLeft, behavior: "auto" });
      ignoreTimer = window.setTimeout(() => {
        ignoreScrollEnd = false;
      }, SNAP_IGNORE_MS);
    };

    syncEndPadding();

    const hasScrollEnd = "onscrollend" in window;

    const onScrollFallback = () => {
      if (ignoreScrollEnd) {
        return;
      }
      window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(
        snapToColumn,
        SCROLL_END_FALLBACK_MS
      );
    };

    if (hasScrollEnd) {
      area.addEventListener("scrollend", snapToColumn);
    } else {
      area.addEventListener("scroll", onScrollFallback, { passive: true });
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        syncEndPadding();
      });
      resizeObserver.observe(area);
      resizeObserver.observe(content);
    }

    return () => {
      area.removeEventListener("scrollend", snapToColumn);
      area.removeEventListener("scroll", onScrollFallback);
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(ignoreTimer);
      resizeObserver?.disconnect();
      content.style.paddingRight = "";
    };
  }, []);

  return (
    <div ref={areaRef} className={cn(className)}>
      <div ref={contentRef} className="w-max max-w-none">
        {children}
      </div>
    </div>
  );
}
