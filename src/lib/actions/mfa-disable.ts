"use server";

import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth, unstable_update } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";

export type MfaDisableState = {
  success: boolean;
  error?: string;
};

export async function disableMfa(
  _prevState: MfaDisableState,
  formData: FormData
): Promise<MfaDisableState> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "認証が必要です。" };
    }

    const password = String(formData.get("password") ?? "");
    if (!password) {
      return { success: false, error: "現在のパスワードを入力してください。" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, totpEnabled: true },
    });

    if (!user?.totpEnabled) {
      return { success: false, error: "二段階認証は有効になっていません。" };
    }

    if (!user.passwordHash) {
      return {
        success: false,
        error: "パスワードが設定されていないため、解除できません。",
      };
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return {
        success: false,
        error: "現在のパスワードが正しくありません。",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: false,
        totpSecret: null,
      },
    });

    await unstable_update({
      user: { totpEnabled: false, mfaVerified: true },
    });

    revalidatePath(ROUTES.settings);

    return { success: true };
  } catch (error) {
    console.error("[mfa-disable] disableMfa failed", error);
    return {
      success: false,
      error:
        "解除処理中にエラーが発生しました。しばらくしてから再度お試しください。",
    };
  }
}
