"use server";

import { auth } from "@/lib/auth";
import {
  DEMO_ACCOUNT_GUARD_MESSAGE,
  isDemoUserEmail,
} from "@/lib/demo/constants";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, createTotpUri, verifyTotpToken } from "@/lib/mfa/totp";
import { prepareBackupCodes } from "@/lib/mfa/backup-codes";

export type MfaSetupState = {
  step: "generate" | "verify" | "backup-codes";
  secret?: string;
  uri?: string;
  email?: string;
  /** 発行直後の平文。ハッシュ保存のため再表示はできない */
  backupCodes?: string[];
  error?: string;
};

export async function initMfaSetup(): Promise<MfaSetupState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { step: "generate", error: "認証が必要です" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.email) {
    return { step: "generate", error: "ユーザーが見つかりません" };
  }

  if (isDemoUserEmail(user.email)) {
    return { step: "generate", error: DEMO_ACCOUNT_GUARD_MESSAGE };
  }

  if (user.totpEnabled) {
    return {
      step: "generate",
      error: "二段階認証はすでに有効です。",
    };
  }

  const secret = generateTotpSecret();
  const uri = createTotpUri(secret, user.email);

  return { step: "verify", secret, uri, email: user.email };
}

export async function confirmMfaSetup(
  _prevState: MfaSetupState,
  formData: FormData
): Promise<MfaSetupState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { step: "generate", error: "認証が必要です" };
  }

  if (isDemoUserEmail(session.user.email)) {
    return { step: "generate", error: DEMO_ACCOUNT_GUARD_MESSAGE };
  }

  const secret = formData.get("secret") as string;
  const token = formData.get("token") as string;

  if (!secret || !token) {
    return {
      step: "verify",
      secret,
      uri: formData.get("uri") as string,
      email: formData.get("email") as string,
      error: "コードを入力してください",
    };
  }

  const isValid = verifyTotpToken(secret, token);
  if (!isValid) {
    return {
      step: "verify",
      secret,
      uri: formData.get("uri") as string,
      email: formData.get("email") as string,
      error: "コードが正しくありません。もう一度お試しください。",
    };
  }

  const userId = session.user.id;

  try {
    const { codes, rows } = await prepareBackupCodes(userId);

    // 有効化とコード発行を一括で行い、片方だけ成功した状態を作らない
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          totpSecret: secret,
          totpEnabled: true,
        },
      }),
      prisma.backupCode.deleteMany({ where: { userId } }),
      prisma.backupCode.createMany({ data: rows }),
    ]);

    return { step: "backup-codes", backupCodes: codes };
  } catch (error) {
    console.error("[mfa-setup] confirmMfaSetup failed", error);
    return {
      step: "verify",
      secret,
      uri: formData.get("uri") as string,
      email: formData.get("email") as string,
      error:
        "設定処理中にエラーが発生しました。しばらくしてから再度お試しください。",
    };
  }
}
