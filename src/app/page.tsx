import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { ROUTES } from "@/lib/routes";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect(ROUTES.subscriptions);
  }

  return <HeroSection />;
}
