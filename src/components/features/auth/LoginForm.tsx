"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginState } from "@/lib/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { CardWrapper } from "./CardWrapper";
import { RequiredFieldMark } from "./RequiredFieldMark";

const initialState: LoginState = { success: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const showResendVerificationLink = state.emailNotVerified === true;

  return (
    <CardWrapper
      headerLabel="ようこそ"
      backButtonLabel="アカウントはまだですか?"
      backButtonHref={ROUTES.signup}
      secondaryBackButtonLabel="トップへ戻る"
      secondaryBackButtonHref={ROUTES.home}
      showSocial
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center my-4">
          メールアドレスとパスワードでログインします。
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
              disabled={pending}
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
              パスワード
              <RequiredFieldMark />
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={pending}
              placeholder="••••••••"
              aria-invalid={state.fieldErrors?.password ? true : undefined}
            />
            {state.fieldErrors?.password ? (
              <p className="text-[10px] text-red-600" role="alert">
                {state.fieldErrors.password}
              </p>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="link"
              asChild
              className="h-auto px-0 py-0 font-normal"
            >
              <Link href={ROUTES.forgotPassword}>パスワードをお忘れですか？</Link>
            </Button>
            {showResendVerificationLink ? (
              <Button
                type="button"
                size="sm"
                variant="link"
                asChild
                className="h-auto block px-0 py-0 font-normal"
              >
                <Link href={ROUTES.resendVerification}>
                  確認メールを再送
                </Link>
              </Button>
            ) : null}
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </CardWrapper>
  );
}
