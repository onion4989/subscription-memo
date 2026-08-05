"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { prisma } from "@/lib/prisma";
import { isColorThemeId, type ColorThemeId } from "@/lib/theme/themes";

export type UpdateColorThemeResult = {
  success: boolean;
  message?: string;
  themeId?: ColorThemeId;
};

export async function updateColorTheme(
  themeId: string
): Promise<UpdateColorThemeResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, message: "認証が必要です。" };
  }

  if (!isColorThemeId(themeId)) {
    return { success: false, message: "無効なテーマです。" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { themeId },
  });

  revalidatePath("/", "layout");

  return { success: true, themeId };
}
