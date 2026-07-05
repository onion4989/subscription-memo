"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import { resolveNotifyChannelUpdate } from "@/lib/renewal-notification/resolve-notify-channel-update";
import {
  notificationSettingsFieldErrorsFromZod,
  notificationSettingsSchema,
  type NotificationSettingsFieldErrors,
} from "@/schemas/notification-settings";

export type UpdateNotificationSettingsState = {
  success: boolean;
  message?: string;
  fieldErrors?: NotificationSettingsFieldErrors;
};

export async function updateNotificationSettings(
  _prevState: UpdateNotificationSettingsState,
  formData: FormData
): Promise<UpdateNotificationSettingsState> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, message: "認証が必要です。" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notifyChannel: true },
  });

  if (!user) {
    return { success: false, message: "ユーザーが見つかりません。" };
  }

  const channelResult = resolveNotifyChannelUpdate({
    submittedChannel: formData.get("notifyChannel") as string | null,
    currentChannel: user.notifyChannel,
  });

  if (!channelResult.ok) {
    return {
      success: false,
      fieldErrors: { notifyChannel: channelResult.error },
    };
  }

  const parsed = notificationSettingsSchema.safeParse({
    notifyLeadDays: String(formData.get("notifyLeadDays") ?? ""),
    notifyChannel: channelResult.notifyChannel,
    notifyDeliveryPaused: String(formData.get("notifyDeliveryPaused") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: notificationSettingsFieldErrorsFromZod(parsed.error),
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      notifyLeadDays: parsed.data.notifyLeadDays,
      notifyChannel: parsed.data.notifyChannel,
      notifyDeliveryPaused: parsed.data.notifyDeliveryPaused,
    },
  });

  revalidatePath(ROUTES.settings);

  return {
    success: true,
    message: "お知らせ設定を保存しました。",
  };
}
