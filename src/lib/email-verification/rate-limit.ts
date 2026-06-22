import {
  RATE_LIMIT_WINDOW_MS,
  RESEND_RATE_LIMIT_PER_EMAIL,
  RESEND_RATE_LIMIT_PER_IP,
} from "@/lib/email-verification/constants";

type WindowEntry = {
  count: number;
  windowStart: number;
};

const emailWindows = new Map<string, WindowEntry>();
const ipWindows = new Map<string, WindowEntry>();

function pruneExpired(map: Map<string, WindowEntry>, now: number): void {
  for (const [key, entry] of map.entries()) {
    if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
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
  if (!existing || now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
    map.set(key, { count: 1, windowStart: now });
    return 1;
  }

  existing.count += 1;
  return existing.count;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "email" | "ip" };

/**
 * 開発・単一インスタンス向けのインメモリ制限。
 * 本番で複数インスタンスに載せる場合は Redis 等への移行を検討する。
 */
export function checkEmailVerificationRateLimit(
  emailKey: string,
  ip: string
): RateLimitResult {
  const now = Date.now();
  pruneExpired(emailWindows, now);
  pruneExpired(ipWindows, now);

  const emailCount = incrementWindow(emailWindows, emailKey, now);
  if (emailCount > RESEND_RATE_LIMIT_PER_EMAIL) {
    return { allowed: false, reason: "email" };
  }

  const ipCount = incrementWindow(ipWindows, ip, now);
  if (ipCount > RESEND_RATE_LIMIT_PER_IP) {
    return { allowed: false, reason: "ip" };
  }

  return { allowed: true };
}
