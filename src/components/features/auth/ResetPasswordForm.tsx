"use client";

import { useActionState } from "react";
import {
  resetPassword,
  type ResetPasswordState,
} from "@/lib/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { CardWrapper } from "./CardWrapper";
import { RequiredFieldMark } from "./RequiredFieldMark";

const initialState: ResetPasswordState = { success: false };

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialState
  );

  if (state.success) {
    return (
      <CardWrapper
        headerLabel="パスワードを更新しました"
        backButtonLabel="ログインページに戻る"
        backButtonHref={ROUTES.login}
      >
        <p className="sr-only">パスワードを更新しました。</p>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      headerLabel="新しいパスワードを設定"
      backButtonLabel="ログインページに戻る"
      backButtonHref={ROUTES.login}
    >
      <div className="space-y-4">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password">
              新しいパスワード
              <RequiredFieldMark />
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "更新中..." : "パスワードを更新"}
          </Button>
        </form>
      </div>
    </CardWrapper>
  );
}
