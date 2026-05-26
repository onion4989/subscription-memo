"use client";

import { useEffect, useState, useActionState } from "react";
import {
  initMfaSetup,
  confirmMfaSetup,
  type MfaSetupState,
} from "@/lib/actions/mfa-setup";
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

const initialState: MfaSetupState = { step: "generate" };

export default function MfaSetupPage() {
  const [setupData, setSetupData] = useState<MfaSetupState>(initialState);
  const [state, formAction, pending] = useActionState(
    confirmMfaSetup,
    initialState
  );

  useEffect(() => {
    initMfaSetup().then(setSetupData);
  }, []);

  if (state.step === "complete" && state.backupCodes) {
    return (
      <main className={AUTH_PAGE_MAIN_CLASS}>
        <Card className={AUTH_CARD_MAX_WIDTH_CLASS}>
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">MFA設定完了</CardTitle>
            <CardDescription>
              バックアップコードは安全な場所に保存してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-2 text-sm font-medium text-yellow-800">
                バックアップコード
              </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {state.backupCodes.map((code) => (
                <span key={code} className="bg-white px-2 py-1 rounded border">
                  {code}
                </span>
              ))}
            </div>
            </div>
            <Button asChild className="w-full">
              <a href={ROUTES.success}>完了</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (setupData.step === "verify" && setupData.uri) {
    return (
      <main className={AUTH_PAGE_MAIN_CLASS}>
        <Card className={AUTH_CARD_MAX_WIDTH_CLASS}>
          <CardHeader className="text-center">
            <CardTitle>MFA設定</CardTitle>
            <CardDescription>
              認証アプリで設定URIを登録し、表示されるコードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="break-all rounded-md bg-slate-50 p-3 font-mono text-xs">
              {setupData.uri}
            </div>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="secret" value={setupData.secret} />
              <input type="hidden" name="uri" value={setupData.uri} />
              <div className="space-y-2">
                <Label htmlFor="token">
                  認証コード（6桁）
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
              {(state.error || setupData.error) && (
                <p className="text-sm text-red-600">
                  {state.error ?? setupData.error}
                </p>
              )}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "確認中..." : "設定を確定"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <p className="text-gray-500">読み込み中...</p>
    </main>
  );
}
