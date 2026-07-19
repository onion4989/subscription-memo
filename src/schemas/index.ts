import * as z from "zod";

/** 新規登録フォーム（メール＋パスワード）。サーバー・クライアントで共通利用 */
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です。")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードは必須です。")
    .min(8, "パスワードは8文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export type SignupFieldErrors = Partial<Record<keyof SignupInput, string>>;

/** Zod の flatten 結果からフィールドごと先頭メッセージだけ取り出す（Server Action の戻り値用） */
export function signupFieldErrorsFromZod(
  error: z.ZodError<SignupInput>
): SignupFieldErrors {
  const { fieldErrors } = error.flatten();
  return {
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
  };
}

/** ログイン（メール・パスワード）。入力ルールは signupSchema と同一 */
export const loginFormSchema = signupSchema;
export type LoginFormInput = SignupInput;
export type LoginFormFieldErrors = SignupFieldErrors;

export const loginFormFieldErrorsFromZod = signupFieldErrorsFromZod;

// Password Reset
export const NewPasswordSchema = z.object({
  //email: z.string().min(1, "メールアドレスは必須です。").email("無効なメールアドレスです。"),
  password: z
    .string()
    .min(1, "パスワードは必須です。")
    .min(8, "パスワードは8文字以上で入力してください")
    .max(128, "パスワードは128文字以内で入力してください"),
});

// Reset
export const ResetSchema = z.object({
  email: z.string().min(1, "メールアドレスは必須です。").email("無効なメールアドレスです。"),
});

// Register（確認用パスワード付き。ルールは signupSchema と同一）
export const RegisterShema = signupSchema
  .extend({
    confirmPassword: z
      .string()
      .min(1, "確認用パスワードは必須です。"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "パスワードが一致しません。",
  });
