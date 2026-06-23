"use client";

import { useSyncExternalStore } from "react";

/** SSR と初回 hydration の出力を一致させる（hydration 後は true） */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
