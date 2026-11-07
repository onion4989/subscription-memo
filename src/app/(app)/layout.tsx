import { auth } from "@/lib/auth";
import { isMfaVerificationPending } from "@/lib/auth/mfa-session";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { ROUTES } from "@/lib/routes";
import { getAppUserDisplay } from "@/lib/user/get-app-user-display";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/features/subscription/AppShell";
import { ColorThemeProvider } from "@/components/providers/ColorThemeProvider";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  // 設定エラー時の truthy error オブジェクトをログイン扱いしない（GHSA-8fpg）
  if (!session?.user) {
    redirect(ROUTES.login);
  }

  if (isMfaVerificationPending(session)) {
    redirect(ROUTES.mfaVerify);
  }

  // JWT に id があればそれを使う（layout 内の auth 二重呼び出しを避ける）
  const userId = session.user.id || (await getAuthenticatedUserId());
  const appUserDisplay = userId
    ? await getAppUserDisplay(userId)
    : { displayName: "ゲスト", avatarId: null, themeId: "default" };

  return (
    <ColorThemeProvider
      initialThemeId={appUserDisplay.themeId}
      className="min-h-screen w-full overflow-x-hidden"
    >
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent">
        <AppShell
          displayName={appUserDisplay.displayName}
          avatarId={appUserDisplay.avatarId}
        >
          {children}
        </AppShell>
      </main>
    </ColorThemeProvider>
  );
}
