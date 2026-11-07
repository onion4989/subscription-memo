"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  demoLogin,
  type DemoLoginState,
} from "@/lib/actions/demo-login";
import { login, type LoginState } from "@/lib/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { CardWrapper } from "./CardWrapper";
import { RequiredFieldMark } from "./RequiredFieldMark";

const initialState: LoginState = { success: false };
const demoInitialState: DemoLoginState = { success: false };

const DEMO_LOGIN_BUTTON_CLASS =
  "w-full bg-emerald-600 text-white hover:bg-emerald-600/90";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [demoState, demoAction, demoPending] = useActionState(
    demoLogin,
    demoInitialState
  );
  const hydrated = useHydrated();
  const viewState = hydrated ? state : initialState;
  const demoView = hydrated ? demoState : demoInitialState;
  const isPending = hydrated && pending;
  const isDemoPending = hydrated && demoPending;
  const anyPending = isPending || isDemoPending;
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
          {viewState.formError ? (
            <p className="text-sm text-red-600" role="alert">
              {viewState.formError}
            </p>
          ) : null}
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
              disabled={anyPending}
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
              disabled={anyPending}
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

          <Button type="submit" disabled={anyPending} className="w-full">
            {isPending ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        <form action={demoAction} className="space-y-2">
          {demoView.formError ? (
            <p className="text-sm text-red-600" role="alert">
              {demoView.formError}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={anyPending}
            className={DEMO_LOGIN_BUTTON_CLASS}
          >
            {isDemoPending ? "ログイン中..." : "デモ試用オートログイン"}
          </Button>
        </form>
      </div>
    </CardWrapper>
  );
}
