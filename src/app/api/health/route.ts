import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 死活監視用。コンテナが起動していても DB が落ちていれば気づけるよう、
 * アプリの応答と DB 疎通の両方を確認する。
 * 未認証で叩ける前提のため、内部情報（エラー内容・バージョン）は返さない。
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("[health] database check failed", {
      error: error instanceof Error ? error.message : "unknown",
    });

    return NextResponse.json({ status: "error" }, { status: 503 });
  }

  return NextResponse.json({ status: "ok" });
}
