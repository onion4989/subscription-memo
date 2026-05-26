"use client";

import { useActionState } from "react";
import {
  forgotPassword,
  type ForgotPasswordState,
} from "@/lib/actions/forgot-password";
import { Button } from "@/components/ui/button";
import { CardWrapper } from "@/components/features/auth/CardWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { AUTH_PAGE_MAIN_CLASS } from "@/lib/auth-page-shell";
import { RequiredFieldMark } from "@/components/features/auth/RequiredFieldMark";

const initialState: ForgotPasswordState = { submitted: false };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    forgotPassword,
    initialState
  );

  if (state.submitted) {
    return (
      <main className={AUTH_PAGE_MAIN_CLASS}>
        <CardWrapper
          headerLabel="メールを確認してください"
          backButtonLabel="ログインページに戻る"
          backButtonHref={ROUTES.login}
        >
          <p className="sr-only">送信を受け付けました。</p>
        </CardWrapper>
      </main>
    );
  }

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <CardWrapper
        headerLabel="パスワードリセット"
        backButtonLabel="ログインページに戻る"
        backButtonHref={ROUTES.login}
      >
        <div className="space-y-4">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                登録メールアドレス
                <RequiredFieldMark />
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "送信中..." : "リセットリンクを送信"}
            </Button>
          </form>
        </div>
      </CardWrapper>
    </main>
  );
}
