import { auth } from "@/lib/auth";
import { isMfaVerificationPending } from "@/lib/auth/mfa-session";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { ROUTES } from "@/lib/routes";
import { getAppUserDisplay } from "@/lib/user/get-app-user-display";
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

  if (isMfaVerificationPending(session)) {
    redirect(ROUTES.mfaVerify);
  }

  const userId = await getAuthenticatedUserId();
  const appUserDisplay = userId
    ? await getAppUserDisplay(userId)
    : { displayName: "ゲスト", avatarId: null };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-linear-to-b from-[#000000] to-[#06648F]">
      <AppShell
        displayName={appUserDisplay.displayName}
        avatarId={appUserDisplay.avatarId}
      >
        {children}
      </AppShell>
    </main>
  );
}
