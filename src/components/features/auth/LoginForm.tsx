"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useHydrated } from "@/hooks/use-hydrated";
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
  const hydrated = useHydrated();
  const viewState = hydrated ? state : initialState;
  const isPending = hydrated && pending;
  const showResendVerificationLink = viewState.emailNotVerified === true;

  return (
    <CardWrapper
      headerTitle="ログイン"
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
              disabled={isPending}
              placeholder="example@mail.com"
              defaultValue={viewState.values?.email ?? ""}
              aria-invalid={viewState.fieldErrors?.email ? true : undefined}
            />
            {viewState.fieldErrors?.email ? (
              <p className="text-[10px] text-red-600" role="alert">
                {viewState.fieldErrors.email}
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
              disabled={isPending}
              placeholder="••••••••"
              aria-invalid={viewState.fieldErrors?.password ? true : undefined}
            />
            {viewState.fieldErrors?.password ? (
              <p className="text-[10px] text-red-600" role="alert">
                {viewState.fieldErrors.password}
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

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </CardWrapper>
  );
}
