type WindowEntry = {
  count: number;
  windowStart: number;
};

export type DualKeyRateResult =
  | { allowed: true }
  | { allowed: false; reason: "email" | "ip" };

/**
 * 単一インスタンス向けインメモリの二重キー（email / ip）窓。
 * 複数台構成では共有されないため、スケール時は別ストアを検討する。
 */
export function createDualKeyRateLimiter(options: {
  windowMs: number;
  emailMax: number;
  ipMax: number;
}) {
  const emailWindows = new Map<string, WindowEntry>();
  const ipWindows = new Map<string, WindowEntry>();

  function pruneExpired(map: Map<string, WindowEntry>, now: number): void {
    for (const [key, entry] of map.entries()) {
      if (now - entry.windowStart >= options.windowMs) {
        map.delete(key);
      }
    }
  }

  function incrementWindow(
    map: Map<string, WindowEntry>,
    key: string,
    now: number
  ): number {
    const existing = map.get(key);
    if (!existing || now - existing.windowStart >= options.windowMs) {
      map.set(key, { count: 1, windowStart: now });
      return 1;
    }

    existing.count += 1;
    return existing.count;
  }

  function check(emailKey: string, ip: string): DualKeyRateResult {
    const now = Date.now();
    pruneExpired(emailWindows, now);
    pruneExpired(ipWindows, now);

    const emailCount = incrementWindow(emailWindows, emailKey, now);
    if (emailCount > options.emailMax) {
      return { allowed: false, reason: "email" };
    }

    const ipCount = incrementWindow(ipWindows, ip, now);
    if (ipCount > options.ipMax) {
      return { allowed: false, reason: "ip" };
    }

    return { allowed: true };
  }

  function resetForTests(): void {
    emailWindows.clear();
    ipWindows.clear();
  }

  return { check, resetForTests };
}
