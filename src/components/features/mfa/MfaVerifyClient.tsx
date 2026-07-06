"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  completeMfaVerification,
  type MfaVerifyState,
} from "@/lib/actions/mfa-verify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import {
  AUTH_CARD_MAX_WIDTH_CLASS,
  AUTH_PAGE_MAIN_CLASS,
} from "@/lib/auth-page-shell";
import { RequiredFieldMark } from "@/components/features/auth/RequiredFieldMark";

const initialState: MfaVerifyState = { success: false };

const INVALID_TOKEN_MESSAGE = "6桁の認証コードを入力してください";

const TOKEN_PATTERN = /^\d{6}$/;

export function MfaVerifyClient() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    completeMfaVerification,
    initialState
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const displayError = clientError ?? state.error;

  useEffect(() => {
    if (state.success) {
      router.push(ROUTES.subscriptions);
      router.refresh();
    }
  }, [router, state.success]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setClientError(null);

    const tokenInput = event.currentTarget.elements.namedItem(
      "token"
    ) as HTMLInputElement | null;
    const token = tokenInput?.value.trim() ?? "";

    if (!TOKEN_PATTERN.test(token)) {
      event.preventDefault();
      setClientError(INVALID_TOKEN_MESSAGE);
      return;
    }

    if (tokenInput) {
      tokenInput.value = token;
    }
  }

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <Card className={AUTH_CARD_MAX_WIDTH_CLASS}>
        <CardHeader className="text-center">
          <CardTitle>二段階認証</CardTitle>
          <CardDescription>
            認証アプリ（Google Authenticator 等）に表示されている 6 桁のコードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={formAction}
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="mfa-verify-token">
                認証コード
                <RequiredFieldMark />
              </Label>
              <Input
                id="mfa-verify-token"
                name="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                aria-invalid={displayError ? true : undefined}
                className="text-center text-lg tracking-widest"
              />
            </div>

            {displayError ? (
              <p className="text-sm text-red-600" role="alert">
                {displayError}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending || state.locked}
              className="w-full"
            >
              {pending ? "確認中..." : "認証"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
