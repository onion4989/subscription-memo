"use client";

import type { CSSProperties, RefCallback } from "react";
import { useCallback, useState, useSyncExternalStore } from "react";
import { SUBSCRIPTION_TABLE_FRAME_DATA_ATTR } from "@/components/features/subscription/SubscriptionTableSection";
import { UpcomingRenewalCallout } from "@/components/features/subscription/UpcomingRenewalCallout";
import type { UpcomingRenewalUrgencyTier } from "@/lib/subscription/renewal-upcoming-notice";
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

/** SSR / 初回は false。モバイルで hidden テーブルのバッジを出さない */
function useIsMdUp(): boolean {
  return useSyncExternalStore(subscribeMdUp, getMdUpSnapshot, () => false);
}

type TableFrameVisibility = {
  isVisible: boolean;
  anchorRef: RefCallback<HTMLSpanElement>;
};

/**
 * 黒いテーブル枠内に列ヘッダーが見えているとき isVisible が true。
 * 横スクロールで枠外に出た列の「更新間近」を出さない。
 * anchorRef が付いた要素が外れている間は観測しないため、
 * 呼び出し側は表示条件を満たすときだけ anchorRef を渡す。
 */
function useIsVisibleInTableFrame(): TableFrameVisibility {
  const [isVisible, setIsVisible] = useState(false);

  const anchorRef = useCallback((anchor: HTMLSpanElement | null) => {
    if (!anchor) {
      return;
    }

    const frame = anchor.closest(`[${SUBSCRIPTION_TABLE_FRAME_DATA_ATTR}]`);
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

    observer.observe(anchor);
    return () => {
      observer.disconnect();
      setIsVisible(false);
    };
  }, []);

  return { isVisible, anchorRef };
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
  const { isVisible, anchorRef } = useIsVisibleInTableFrame();

  if (urgencyTier === null || !isMdUp) {
    return (
      <th scope="col" className={className} style={style} title={name}>
        {name}
      </th>
    );
  }

  return (
    <th
      scope="col"
      className={cn(
        className,
        // truncate（overflow:hidden）より後に置き、吹き出しが th 外へ出せるようにする
        "relative overflow-visible"
      )}
      style={style}
      title={name}
    >
      <span ref={anchorRef} className="block truncate">
        {name}
      </span>
      {isVisible ? (
        <UpcomingRenewalCallout
          urgencyTier={urgencyTier}
          placement="tableHeader"
        />
      ) : null}
    </th>
  );
}
