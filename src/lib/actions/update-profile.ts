"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { normalizeEmail } from "@/lib/email";
import { EMAIL_VERIFICATION_AUDIT_EVENTS } from "@/lib/email-verification/audit-log";
import { issueAndSendVerificationEmail } from "@/lib/email-verification/issue-and-send";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { isOAuthProvider } from "@/lib/auth/mark-oauth-email-verified";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import {
  profileFieldErrorsFromZod,
  profileUpdateSchema,
  type ProfileFieldErrors,
  type ProfileFormValues,
} from "@/schemas/profile";

export type UpdateProfileState = {
  success: boolean;
  message?: string;
  fieldErrors?: ProfileFieldErrors;
  values?: ProfileFormValues;
};

function revalidateAppLayout() {
  revalidatePath(ROUTES.account, "layout");
  revalidatePath(ROUTES.subscriptions, "layout");
  revalidatePath(ROUTES.settings, "layout");
}

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { success: false, message: "認証が必要です。" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true },
  });

  if (!user) {
    return { success: false, message: "ユーザーが見つかりません。" };
  }

  const hasPassword = Boolean(user.passwordHash);
  const emailReadonly = user.accounts.some((account) =>
    isOAuthProvider(account.provider)
  );

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: emailReadonly
      ? (user.email ?? "")
      : String(formData.get("email") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    avatarId: String(formData.get("avatarId") ?? ""),
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    emailEditable: !emailReadonly,
    hasPassword,
  };

  const parsed = profileUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: profileFieldErrorsFromZod(parsed.error),
      values: {
        name: raw.name,
        email: raw.email,
        phoneNumber: raw.phoneNumber,
        avatarId: Number.isFinite(Number(raw.avatarId))
          ? Number(raw.avatarId)
          : user.avatarId,
        emailReadonly,
        hasPassword,
      },
    };
  }

  const data = parsed.data;
  const normalizedEmail = normalizeEmail(data.email);
  const emailChanged =
    !emailReadonly && normalizeEmail(user.email ?? "") !== normalizedEmail;

  if (emailChanged) {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing && existing.id !== userId) {
      return {
        success: false,
        fieldErrors: { email: "このメールアドレスは既に使用されています。" },
        values: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber ?? "",
          avatarId: data.avatarId,
          emailReadonly,
          hasPassword,
        },
      };
    }
  }

  if (data.newPassword) {
    const isValid = await compare(data.currentPassword, user.passwordHash!);
    if (!isValid) {
      return {
        success: false,
        fieldErrors: { currentPassword: "現在のパスワードが正しくありません。" },
        values: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber ?? "",
          avatarId: data.avatarId,
          emailReadonly,
          hasPassword,
        },
      };
    }
  }

  const passwordHash = data.newPassword
    ? await hash(data.newPassword, 12)
    : undefined;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phoneNumber: data.phoneNumber,
      avatarId: data.avatarId,
      ...(emailChanged
        ? {
            email: normalizedEmail,
            emailVerified: null,
          }
        : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  if (emailChanged) {
    const sendResult = await issueAndSendVerificationEmail({
      email: normalizedEmail,
      userId,
      auditEventOk: EMAIL_VERIFICATION_AUDIT_EVENTS.resendOk,
      auditEventFailed: EMAIL_VERIFICATION_AUDIT_EVENTS.resendFailed,
    });

    revalidateAppLayout();

    if (!sendResult.ok) {
      return {
        success: true,
        message:
          "プロフィールを保存しました。メールアドレスが変更されたため、確認メールの送信に失敗しました。各種設定画面から再送してください。",
        values: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber ?? "",
          avatarId: data.avatarId,
          emailReadonly,
          hasPassword,
        },
      };
    }

    return {
      success: true,
      message:
        "プロフィールを保存しました。新しいメールアドレス宛に確認メールを送信しました。",
      values: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber ?? "",
        avatarId: data.avatarId,
        emailReadonly,
        hasPassword,
      },
    };
  }

  revalidateAppLayout();

  return {
    success: true,
    message: "プロフィールを保存しました。",
    values: {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber ?? "",
      avatarId: data.avatarId,
      emailReadonly,
      hasPassword,
    },
  };
}
