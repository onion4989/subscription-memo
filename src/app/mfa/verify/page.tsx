"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyMfa, type MfaVerifyState } from "@/lib/actions/mfa-verify";
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

export default function MfaVerifyPage() {
  const router = useRouter();
  const [state, setState] = useState<MfaVerifyState>({ success: false });
  const [useBackup, setUseBackup] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const userId = formData.get("userId") as string;
    if (useBackup) {
      formData.set("useBackup", "true");
    }
    const result = await verifyMfa(userId, formData);
    setState(result);
    setPending(false);

    if (result.success) {
      router.push(ROUTES.success);
    }
  }

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <Card className={AUTH_CARD_MAX_WIDTH_CLASS}>
        <CardHeader className="text-center">
          <CardTitle>二段階認証</CardTitle>
          <CardDescription>
            {useBackup
              ? "バックアップコードを入力してください"
              : "認証アプリに表示されている6桁のコードを入力してください"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="userId" value="" />
            <div className="space-y-2">
              <Label htmlFor="token">
                {useBackup ? "バックアップコード" : "認証コード"}
                <RequiredFieldMark />
              </Label>
              <Input
                id="token"
                name="token"
                type="text"
                inputMode={useBackup ? "text" : "numeric"}
                maxLength={useBackup ? 8 : 6}
                required
                autoComplete="one-time-code"
                className="text-center text-lg tracking-widest"
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}

            <Button
              type="submit"
              disabled={pending || state.locked}
              className="w-full"
            >
              {pending ? "確認中..." : "認証"}
            </Button>
          </form>

          <Button
            type="button"
            variant="link"
            onClick={() => setUseBackup(!useBackup)}
            className="w-full"
          >
            {useBackup ? "認証アプリを使う" : "バックアップコードを使う"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
