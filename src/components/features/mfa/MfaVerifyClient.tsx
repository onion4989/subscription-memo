"use client";

import { useState } from "react";
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

export function MfaVerifyClient() {
  const router = useRouter();
  const [state, setState] = useState<MfaVerifyState>({ success: false });
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await completeMfaVerification(formData);
    setState(result);
    setPending(false);

    if (result.success) {
      router.push(ROUTES.subscriptions);
      router.refresh();
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
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">
                認証コード
                <RequiredFieldMark />
              </Label>
              <Input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoComplete="one-time-code"
                className="text-center text-lg tracking-widest"
              />
            </div>

            {state.error ? (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
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
