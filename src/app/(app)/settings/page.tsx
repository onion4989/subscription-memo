import { redirect } from "next/navigation";
import { NotificationSettingsForm } from "@/components/features/settings/NotificationSettingsForm";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
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

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <h1 className="sr-only">各種設定</h1>
      <NotificationSettingsForm
        initialValues={toNotificationSettingsFormValues({
          notifyLeadDays: user.notifyLeadDays,
          notifyChannel: user.notifyChannel,
          notifyDeliveryPaused: user.notifyDeliveryPaused,
        })}
        emailVerified={user.emailVerified !== null}
        totpEnabled={user.totpEnabled}
      />
    </div>
  );
}
