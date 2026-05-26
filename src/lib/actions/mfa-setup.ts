"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, createTotpUri, verifyTotpToken } from "@/lib/mfa/totp";
import { generateBackupCodes, saveBackupCodes } from "@/lib/mfa/backup-codes";

export type MfaSetupState = {
  step: "generate" | "verify" | "complete";
  secret?: string;
  uri?: string;
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

  const secret = generateTotpSecret();
  const uri = createTotpUri(secret, user.email);

  return { step: "verify", secret, uri };
}

export async function confirmMfaSetup(
  _prevState: MfaSetupState,
  formData: FormData
): Promise<MfaSetupState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { step: "generate", error: "認証が必要です" };
  }

  const secret = formData.get("secret") as string;
  const token = formData.get("token") as string;

  if (!secret || !token) {
    return { step: "verify", secret, error: "コードを入力してください" };
  }

  const isValid = verifyTotpToken(secret, token);
  if (!isValid) {
    return {
      step: "verify",
      secret,
      uri: formData.get("uri") as string,
      error: "コードが正しくありません。もう一度お試しください。",
    };
  }

  const backupCodes = generateBackupCodes();
  await saveBackupCodes(session.user.id, backupCodes);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totpSecret: secret,
      totpEnabled: true,
    },
  });

  return { step: "complete", backupCodes };
}
