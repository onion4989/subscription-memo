import {
  SUB_REG_RATE_LIMIT_PER_MIN,
  SUB_REG_RATE_LIMIT_WINDOW_MS,
} from "@/lib/subscription/constants";

type WindowEntry = {
  count: number;
  windowStart: number;
};

const userWindows = new Map<string, WindowEntry>();

function pruneExpired(now: number): void {
  for (const [key, entry] of userWindows.entries()) {
    if (now - entry.windowStart >= SUB_REG_RATE_LIMIT_WINDOW_MS) {
      userWindows.delete(key);
    }
  }
}

export function checkSubscriptionRegisterRateLimit(userId: string): boolean {
  const now = Date.now();
  pruneExpired(now);

  const existing = userWindows.get(userId);
  if (
    !existing ||
    now - existing.windowStart >= SUB_REG_RATE_LIMIT_WINDOW_MS
  ) {
    userWindows.set(userId, { count: 1, windowStart: now });
    return true;
  }

  existing.count += 1;
  return existing.count <= SUB_REG_RATE_LIMIT_PER_MIN;
}
