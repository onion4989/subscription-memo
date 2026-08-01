"use server";

import { auth, unstable_update } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/mfa/totp";
import { consumeBackupCode } from "@/lib/mfa/backup-codes";
import { isLockedOut, recordAttempt } from "@/lib/mfa/lockout";

const MFA_VERIFY_UNEXPECTED_ERROR_MESSAGE =
  "認証処理中にエラーが発生しました。しばらくしてから再度お試しください。";

const MFA_VERIFY_LOCKED_MESSAGE =
  "試行回数の上限に達しました。15分後に再試行してください。";

export type MfaVerifyMode = "totp" | "backup";

export type MfaVerifyState = {
  success: boolean;
  error?: string;
  locked?: boolean;
  /** エラーがどちらの入力に対するものかを画面側で判別するために返す */
  mode?: MfaVerifyMode;
};

/** ロック中は TOTP・バックアップコードのどちらも受け付けない */
async function rejectIfLockedOut(
  userId: string,
  mode: MfaVerifyMode
): Promise<MfaVerifyState | null> {
  const locked = await isLockedOut(userId);

  if (!locked) {
    return null;
  }

  return {
    success: false,
    locked: true,
    mode,
    error: MFA_VERIFY_LOCKED_MESSAGE,
  };
}

async function verifyTotpForSessionUser(
  userId: string,
  token: string
): Promise<MfaVerifyState> {
  const lockedState = await rejectIfLockedOut(userId, "totp");
  if (lockedState) {
    return lockedState;
  }

  if (!token) {
    return { success: false, mode: "totp", error: "コードを入力してください" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!user?.totpEnabled || !user.totpSecret) {
    return { success: false, mode: "totp", error: "MFAが設定されていません" };
  }

  const isValid = verifyTotpToken(user.totpSecret, token);

  await recordAttempt(userId, isValid);

  if (!isValid) {
    return {
      success: false,
      mode: "totp",
      error: "認証コードが正しくありません",
    };
  }

  return { success: true };
}

async function verifyBackupCodeForSessionUser(
  userId: string,
  backupCode: string
): Promise<MfaVerifyState> {
  const lockedState = await rejectIfLockedOut(userId, "backup");
  if (lockedState) {
    return lockedState;
  }

  if (!backupCode) {
    return {
      success: false,
      mode: "backup",
      error: "バックアップコードを入力してください",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpEnabled: true },
  });

  if (!user?.totpEnabled) {
    return { success: false, mode: "backup", error: "MFAが設定されていません" };
  }

  const isValid = await consumeBackupCode(userId, backupCode);

  await recordAttempt(userId, isValid);

  if (!isValid) {
    return {
      success: false,
      mode: "backup",
      error: "バックアップコードが正しくありません",
    };
  }

  return { success: true };
}

export async function completeMfaVerification(
  _prevState: MfaVerifyState,
  formData: FormData
): Promise<MfaVerifyState> {
  const mode: MfaVerifyMode =
    formData.get("mode") === "backup" ? "backup" : "totp";

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, mode, error: "認証が必要です" };
    }

    if (!session.user.totpEnabled) {
      return { success: false, mode, error: "MFAが設定されていません" };
    }

    if (session.user.mfaVerified) {
      return { success: true };
    }

    const result =
      mode === "backup"
        ? await verifyBackupCodeForSessionUser(
            userId,
            String(formData.get("backupCode") ?? "").trim()
          )
        : await verifyTotpForSessionUser(
            userId,
            String(formData.get("token") ?? "").trim()
          );

    if (!result.success) {
      return result;
    }

    await unstable_update({ user: { mfaVerified: true } });

    return { success: true };
  } catch (error) {
    console.error("[mfa-verify] completeMfaVerification failed", error);
    return {
      success: false,
      mode,
      error: MFA_VERIFY_UNEXPECTED_ERROR_MESSAGE,
    };
  }
}
