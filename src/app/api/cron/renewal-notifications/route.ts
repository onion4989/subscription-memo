import { NextResponse } from "next/server";
import { runRenewalNotificationDailyJob } from "@/lib/renewal-notification/daily-job";
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

export async function POST(request: Request) {
  const expectedToken = process.env.RENEWAL_JOB_SECRET;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "RENEWAL_JOB_SECRET is not configured" },
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
    const result = await runRenewalNotificationDailyJob({ asOfYmd });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[renewal-notification] daily job failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Failed to run renewal notification job" },
      { status: 500 }
    );
  }
}
