"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email";
import {
  signupFieldErrorsFromZod,
  signupSchema,
  type SignupFieldErrors,
} from "@/schemas/index";

export type SignupState = {
  success: boolean;
  fieldErrors?: SignupFieldErrors;
  values?: {
    email?: string;
  };
};

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: signupFieldErrorsFromZod(parsed.error),
      values: {
        email: raw.email,
      },
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const { password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      fieldErrors: {
        email: "このメールアドレスは既に登録されています",
      },
      values: {
        email,
      },
    };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  return { success: true };
}
