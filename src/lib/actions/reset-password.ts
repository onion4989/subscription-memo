"use server";

import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

  const tokens = await prisma.passwordResetToken.findMany({
    where: {
      usedAt: null,
      expires: { gt: new Date() },
    },
    include: { user: true },
  });

  let matchedToken: (typeof tokens)[number] | null = null;
  for (const t of tokens) {
    const isMatch = await compare(token, t.tokenHash);
    if (isMatch) {
      matchedToken = t;
      break;
    }
  }

  if (!matchedToken) {
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
