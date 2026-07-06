"use server";

import { auth, unstable_update } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/mfa/totp";
import { isLockedOut, recordAttempt } from "@/lib/mfa/lockout";

const MFA_VERIFY_UNEXPECTED_ERROR_MESSAGE =
  "認証処理中にエラーが発生しました。しばらくしてから再度お試しください。";

export type MfaVerifyState = {
  success: boolean;
  error?: string;
  locked?: boolean;
};

async function verifyTotpForSessionUser(
  userId: string,
  token: string
): Promise<MfaVerifyState> {
  const locked = await isLockedOut(userId);
  if (locked) {
    return {
      success: false,
      locked: true,
      error: "試行回数の上限に達しました。15分後に再試行してください。",
    };
  }

  if (!token) {
    return { success: false, error: "コードを入力してください" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!user?.totpEnabled || !user.totpSecret) {
    return { success: false, error: "MFAが設定されていません" };
  }

  const isValid = verifyTotpToken(user.totpSecret, token);

  await recordAttempt(userId, isValid);

  if (!isValid) {
    return {
      success: false,
      error: "認証コードが正しくありません",
    };
  }

  return { success: true };
}

export async function completeMfaVerification(
  _prevState: MfaVerifyState,
  formData: FormData
): Promise<MfaVerifyState> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    if (!session.user.totpEnabled) {
      return { success: false, error: "MFAが設定されていません" };
    }

    if (session.user.mfaVerified) {
      return { success: true };
    }

    const token = String(formData.get("token") ?? "").trim();
    const result = await verifyTotpForSessionUser(userId, token);

    if (!result.success) {
      return result;
    }

    await unstable_update({ user: { mfaVerified: true } });

    return { success: true };
  } catch (error) {
    console.error("[mfa-verify] completeMfaVerification failed", error);
    return {
      success: false,
      error: MFA_VERIFY_UNEXPECTED_ERROR_MESSAGE,
    };
  }
}
