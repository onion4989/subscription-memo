"use client";

import { useActionState } from "react";
import { signup, type SignupState } from "@/lib/actions/signup";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { CardWrapper } from "./CardWrapper";
import { RequiredFieldMark } from "./RequiredFieldMark";

const initialState: SignupState = { success: false };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <CardWrapper
        headerLabel="登録完了"
        backButtonLabel="ログインページへ"
        backButtonHref={ROUTES.login}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {state.message ??
              "入力内容を受け付けました。メールをご確認ください。"}
          </p>
          <p className="text-xs text-muted-foreground">
            リンクの有効期限は1時間です。届かない場合は迷惑メールフォルダもご確認ください。
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href={ROUTES.resendVerification}>確認メールを再送</Link>
          </Button>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      headerLabel="アカウント作成"
      backButtonLabel="既にアカウントをお持ちですか?"
      backButtonHref={ROUTES.login}
      showSocial
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center my-4">
          メールアドレスとパスワードで新規登録します。
        </p>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              メールアドレス
              <RequiredFieldMark />
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="example@mail.com"
              defaultValue={state.values?.email ?? ""}
              aria-invalid={state.fieldErrors?.email ? true : undefined}
            />
            {state.fieldErrors?.email ? (
              <p className="text-[10px] text-red-600" role="alert">
                {state.fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              パスワード（8文字以上）
              <RequiredFieldMark />
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={state.fieldErrors?.password ? true : undefined}
            />
            {state.fieldErrors?.password ? (
              <p className="text-[10px] text-red-600" role="alert">
                {state.fieldErrors.password}
              </p>
            ) : null}
          </div>
          
          <Button type="submit" disabled={pending} className="w-full mt-8">
            {pending ? "登録中..." : "アカウント作成"}
          </Button>
        </form>
      </div>
    </CardWrapper>
  );
}
