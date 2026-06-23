"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * bfcache 復元時に子コンポーネントをリマウントし、古いクライアント状態と
 * 新しい RSC の不一致（hydration error）を防ぐ。
 */
export function useBfcacheRemountKey(): number {
  const router = useRouter();
  const [key, setKey] = useState(0);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setKey((current) => current + 1);
      router.refresh();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  return key;
}
