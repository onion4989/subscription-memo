import { z } from "zod";

export {
  loginFormSchema,
  loginFormSchema as loginSchema,
  loginFormFieldErrorsFromZod,
  type LoginFormInput,
  type LoginFormFieldErrors,
  signupSchema,
  type SignupInput,
  type SignupFieldErrors,
  signupFieldErrorsFromZod,
} from "@/schemas/index";

export type { LoginFormInput as LoginInput } from "@/schemas/index";

/**
 * ログイン後のユーザー情報ページで `User.name`（表示名／ニックネーム）を更新するときに使う。
 * 実装時は認証済みユーザーのみ更新し、Server Action 等でこのスキーマに通す。
 */
export const profileNicknameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "ニックネームを入力してください")
    .max(100, "ニックネームは100文字以内で入力してください"),
});

export type ProfileNicknameInput = z.infer<typeof profileNicknameSchema>;
