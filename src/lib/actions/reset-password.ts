"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { digestToken } from "@/lib/auth/token-digest";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export type ResetPasswordState = {
  success: boolean;
  error?: string;
};

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: "入力内容を確認してください" };
  }

  const { token, password } = parsed.data;
  const tokenHash = digestToken(token.trim());

  const matchedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expires: true,
      usedAt: true,
    },
  });

  if (
    !matchedToken ||
    matchedToken.usedAt !== null ||
    matchedToken.expires.getTime() <= Date.now()
  ) {
    return {
      success: false,
      error: "リセットリンクが無効または期限切れです",
    };
  }

  const passwordHash = await hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: matchedToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
