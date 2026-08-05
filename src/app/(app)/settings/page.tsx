import { redirect } from "next/navigation";
import { NotificationSettingsForm } from "@/components/features/settings/NotificationSettingsForm";
import { DefaultThemeContent } from "@/components/features/theme/DefaultThemeContent";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { isDemoUserEmail } from "@/lib/demo/constants";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import { toNotificationSettingsFormValues } from "@/schemas/notification-settings";

export default async function SettingsPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(ROUTES.login);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      notifyLeadDays: true,
      notifyChannel: true,
      notifyDeliveryPaused: true,
      emailVerified: true,
      totpEnabled: true,
    },
  });

  if (!user) {
    redirect(ROUTES.login);
  }

  const isDemoAccount = isDemoUserEmail(user.email);

  return (
    <DefaultThemeContent>
      <div>
        <h1 className="text-2xl font-bold">一般設定</h1>
        <p className="mt-2 text-sm opacity-80">
          お知らせの送信方法や二段階認証の設定を行えます。
        </p>
        {isDemoAccount ? (
          <p className="mt-2 text-sm text-amber-200/90">
            デモアカウントのため、二段階認証の設定はご利用いただけません。データは毎日リセットされます。
          </p>
        ) : null}
      </div>

      <NotificationSettingsForm
        initialValues={toNotificationSettingsFormValues({
          notifyLeadDays: user.notifyLeadDays,
          notifyChannel: user.notifyChannel,
          notifyDeliveryPaused: user.notifyDeliveryPaused,
        })}
        emailVerified={user.emailVerified !== null}
        totpEnabled={user.totpEnabled}
        mfaControlsEnabled={!isDemoAccount}
      />
    </DefaultThemeContent>
  );
}
