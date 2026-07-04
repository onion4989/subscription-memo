import * as z from "zod";
import { AVATAR_IDS } from "@/lib/user/avatar";

const phoneNumberSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^0\d{10}$/.test(value),
    "電話番号は半角数字11桁で入力してください（例: 09011112222）"
  )
  .transform((value) => (value === "" ? null : value));

export const profileUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "ニックネームを入力してください")
      .max(15, "ニックネームは15文字以内で入力してください"),
    email: z
      .string()
      .trim()
      .min(1, "メールアドレスを入力してください")
      .email("有効なメールアドレスを入力してください"),
    phoneNumber: phoneNumberSchema,
    avatarId: z.coerce
      .number({ message: "アバターを選択してください" })
      .refine(
        (value) => AVATAR_IDS.includes(value as (typeof AVATAR_IDS)[number]),
        "アバターを選択してください"
      ),
    currentPassword: z.string(),
    newPassword: z.string(),
    emailEditable: z.boolean(),
    hasPassword: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const wantsPasswordChange =
      data.currentPassword.length > 0 || data.newPassword.length > 0;

    if (!data.hasPassword && wantsPasswordChange) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "パスワードは変更できません",
      });
      return;
    }

    if (wantsPasswordChange) {
      if (!data.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message: "現在のパスワードを入力してください",
        });
      }

      if (!data.newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "新しいパスワードを入力してください",
        });
      } else if (data.newPassword.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "新しいパスワードは8文字以上で入力してください",
        });
      } else if (data.newPassword.length > 128) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "新しいパスワードは128文字以内で入力してください",
        });
      }
    }
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export type ProfileFormValues = {
  name: string;
  email: string;
  phoneNumber: string;
  avatarId: number | null;
  emailReadonly: boolean;
  hasPassword: boolean;
};

export type ProfileFieldErrors = Partial<
  Record<
    | "name"
    | "email"
    | "phoneNumber"
    | "avatarId"
    | "currentPassword"
    | "newPassword"
    | "form",
    string
  >
>;

export function profileFieldErrorsFromZod(
  error: z.ZodError<ProfileUpdateInput>
): ProfileFieldErrors {
  const { fieldErrors } = error.flatten();
  return {
    name: fieldErrors.name?.[0],
    email: fieldErrors.email?.[0],
    phoneNumber: fieldErrors.phoneNumber?.[0],
    avatarId: fieldErrors.avatarId?.[0],
    currentPassword: fieldErrors.currentPassword?.[0],
    newPassword: fieldErrors.newPassword?.[0],
  };
}

export function toProfileFormValues(input: {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatarId: number | null;
  emailReadonly: boolean;
  hasPassword: boolean;
}): ProfileFormValues {
  return {
    name: input.name?.trim() || "",
    email: input.email ?? "",
    phoneNumber: input.phoneNumber ?? "",
    avatarId: input.avatarId,
    emailReadonly: input.emailReadonly,
    hasPassword: input.hasPassword,
  };
}
