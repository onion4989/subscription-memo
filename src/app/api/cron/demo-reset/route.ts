import { NextResponse } from "next/server";
import { resetDemoAccount } from "@/lib/demo/reset-demo-account";
import { prisma } from "@/lib/prisma";
import { isValidYmd } from "@/lib/subscription/renewal-date";

export const runtime = "nodejs";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function readBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

/**
 * デモユーザーを日次で初期状態へ戻す。
 * Dokploy / 外部 Cron から 1 日 1 回呼び出す想定。
 */
export async function POST(request: Request) {
  const expectedToken = process.env.DEMO_RESET_JOB_SECRET;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "DEMO_RESET_JOB_SECRET is not configured" },
      { status: 500 }
    );
  }

  const token = readBearerToken(request.headers.get("authorization"));
  if (!token || token !== expectedToken) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const asOfYmd = url.searchParams.get("asOfYmd") ?? undefined;
  if (asOfYmd && !isValidYmd(asOfYmd)) {
    return NextResponse.json(
      { error: "Invalid asOfYmd. Use YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  try {
    const result = await resetDemoAccount(prisma, { asOfYmd });
    console.log("[demo-reset] ok", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[demo-reset] failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Failed to reset demo account" },
      { status: 500 }
    );
  }
}
