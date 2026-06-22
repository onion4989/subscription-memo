"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resendVerification,
  type ResendVerificationState,
} from "@/lib/actions/resend-verification";
import { Button } from "@/components/ui/button";
import { CardWrapper } from "@/components/features/auth/CardWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMark } from "@/components/features/auth/RequiredFieldMark";
import { AUTH_PAGE_MAIN_CLASS } from "@/lib/auth-page-shell";
import { ROUTES } from "@/lib/routes";

const initialState: ResendVerificationState = {
  submitted: false,
  outcome: null,
  message: "",
};

export default function ResendVerificationPage() {
  const [state, formAction, pending] = useActionState(
    resendVerification,
    initialState
  );

  if (state.submitted) {
    const isAlreadyVerified = state.outcome === "alreadyVerified";

    return (
      <main className={AUTH_PAGE_MAIN_CLASS}>
        <CardWrapper
          headerLabel={isAlreadyVerified ? "確認済みです" : "送信を受け付けました"}
          backButtonLabel={
            isAlreadyVerified ? undefined : "ログインページに戻る"
          }
          backButtonHref={isAlreadyVerified ? undefined : ROUTES.login}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{state.message}</p>
            {isAlreadyVerified ? (
              <Button asChild className="w-full">
                <Link href={ROUTES.login}>ログインページへ</Link>
              </Button>
            ) : null}
          </div>
        </CardWrapper>
      </main>
    );
  }

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <CardWrapper
        headerLabel="確認メールを再送"
        backButtonLabel="ログインページに戻る"
        backButtonHref={ROUTES.login}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            登録時のメールアドレスを入力してください。未確認のアカウントがある場合、確認メールを送信します。
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
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "送信中..." : "確認メールを再送"}
            </Button>
          </form>
        </div>
      </CardWrapper>
    </main>
  );
}
