"use server";

import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/mfa/totp";
import { verifyBackupCode } from "@/lib/mfa/backup-codes";
import { isLockedOut, recordAttempt } from "@/lib/mfa/lockout";

export type MfaVerifyState = {
  success: boolean;
  error?: string;
  locked?: boolean;
};

export async function verifyMfa(
  userId: string,
  formData: FormData
): Promise<MfaVerifyState> {
  const locked = await isLockedOut(userId);
  if (locked) {
    return {
      success: false,
      locked: true,
      error: "試行回数の上限に達しました。15分後に再試行してください。",
    };
  }

  const token = formData.get("token") as string;
  const useBackup = formData.get("useBackup") === "true";

  if (!token) {
    return { success: false, error: "コードを入力してください" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpSecret: true },
  });

  if (!user?.totpSecret) {
    return { success: false, error: "MFAが設定されていません" };
  }

  let isValid = false;

  if (useBackup) {
    isValid = await verifyBackupCode(userId, token);
  } else {
    isValid = verifyTotpToken(user.totpSecret, token);
  }

  await recordAttempt(userId, isValid);

  if (!isValid) {
    return {
      success: false,
      error: useBackup
        ? "バックアップコードが正しくありません"
        : "認証コードが正しくありません",
    };
  }

  return { success: true };
}
