import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { GUEST_DISPLAY_NAME } from "@/lib/user/avatar";

export type AppUserDisplay = {
  displayName: string;
  avatarId: number | null;
  themeId: string;
};

export const getAppUserDisplay = cache(
  async (userId: string): Promise<AppUserDisplay> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        avatarId: true,
        themeId: true,
      },
    });

    return {
      displayName: user?.name?.trim() || GUEST_DISPLAY_NAME,
      avatarId: user?.avatarId ?? null,
      themeId: user?.themeId ?? "default",
    };
  }
);
