"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import {
  ACCOUNT_DELETE_CONFIRMATION_PHRASE,
  ACCOUNT_DELETION_EMAIL_SUBJECT,
  buildAccountDeletionEmailText,
} from "@/lib/account-deletion/constants";
import { sendPlainTextEmail } from "@/lib/email/smtp";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";

export type DeleteAccountState = {
  success: boolean;
  error?: string;
};

async function sendDeletionConfirmationEmail(params: {
  to: string;
  displayName: string | null;
}): Promise<void> {
  await sendPlainTextEmail({
    to: params.to,
    subject: ACCOUNT_DELETION_EMAIL_SUBJECT,
    text: buildAccountDeletionEmailText({
      displayName: params.displayName,
    }),
  });
}

export async function deleteAccount(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "認証が必要です。" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return { success: false, error: "認証が必要です。" };
    }

    if (user.passwordHash) {
      const password = String(formData.get("password") ?? "");
      if (!password) {
        return {
          success: false,
          error: "現在のパスワードを入力してください。",
        };
      }

      const isValid = await compare(password, user.passwordHash);
      if (!isValid) {
        return {
          success: false,
          error: "現在のパスワードが正しくありません。",
        };
      }
    } else {
      const confirmation = String(
        formData.get("confirmationPhrase") ?? ""
      ).trim();
      if (confirmation !== ACCOUNT_DELETE_CONFIRMATION_PHRASE) {
        return {
          success: false,
          error: `確認のため「${ACCOUNT_DELETE_CONFIRMATION_PHRASE}」と入力してください。`,
        };
      }
    }

    const emailForNotice = user.email;
    const nameForNotice = user.name;

    await prisma.user.delete({
      where: { id: userId },
    });

    if (emailForNotice) {
      try {
        await prisma.verificationToken.deleteMany({
          where: { identifier: emailForNotice },
        });
      } catch (error) {
        console.error("[account-deletion] verificationToken cleanup failed", {
          error: error instanceof Error ? error.message : "unknown",
        });
      }

      try {
        await sendDeletionConfirmationEmail({
          to: emailForNotice,
          displayName: nameForNotice,
        });
      } catch (error) {
        console.error("[account-deletion] confirmation email failed", {
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    }
  } catch (error) {
    console.error("[account-deletion] deleteAccount failed", error);
    return {
      success: false,
      error:
        "削除処理中にエラーが発生しました。しばらくしてから再度お試しください。",
    };
  }

  try {
    await signOut({ redirect: false });
  } catch (error) {
    console.error("[account-deletion] signOut failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  }

  redirect(ROUTES.home);
}
