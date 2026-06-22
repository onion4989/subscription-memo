import { headers } from "next/headers";

export async function getRequestMeta(): Promise<{
  ip: string;
  userAgent: string | undefined;
}> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";

  return {
    ip,
    userAgent: h.get("user-agent") ?? undefined,
  };
}
