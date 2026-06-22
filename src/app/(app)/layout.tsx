import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/features/subscription/AppShell";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect(ROUTES.login);
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-linear-to-b from-[#000000] to-[#06648F]">
      <AppShell userLabel="User">{children}</AppShell>
    </main>
  );
}
