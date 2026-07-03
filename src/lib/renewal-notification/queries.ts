import type { NotifyChannel, NotifyLeadDays } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type UserNotificationSettings = {
  notifyLeadDays: NotifyLeadDays;
  notifyChannel: NotifyChannel;
  notifyDeliveryPaused: boolean;
  email: string | null;
  emailVerified: boolean;
};

export async function getUserNotificationSettings(
  userId: string
): Promise<UserNotificationSettings | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notifyLeadDays: true,
      notifyChannel: true,
      notifyDeliveryPaused: true,
      email: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    notifyLeadDays: user.notifyLeadDays,
    notifyChannel: user.notifyChannel,
    notifyDeliveryPaused: user.notifyDeliveryPaused,
    email: user.email,
    emailVerified: user.emailVerified !== null,
  };
}
