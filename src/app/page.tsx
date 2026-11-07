import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { ROUTES } from "@/lib/routes";

export default async function HomePage() {
  const session = await auth();

  // 設定エラー時の truthy error オブジェクトをログイン扱いしない（GHSA-8fpg）
  if (session?.user) {
    redirect(ROUTES.subscriptions);
  }

  return <HeroSection />;
}
