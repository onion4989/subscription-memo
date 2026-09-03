"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  completeMfaVerification,
  type MfaVerifyMode,
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
import { signOut } from "next-auth/react";
import {
  AUTH_CARD_MAX_WIDTH_CLASS,
  AUTH_PAGE_MAIN_CLASS,
} from "@/lib/auth-page-shell";
import { RequiredFieldMark } from "@/components/features/auth/RequiredFieldMark";

const initialState: MfaVerifyState = { success: false };

const INVALID_TOKEN_MESSAGE = "6桁の認証コードを入力してください";

const EMPTY_BACKUP_CODE_MESSAGE = "バックアップコードを入力してください";

const TOKEN_PATTERN = /^\d{6}$/;

/** 10 文字のコード + 表示用ハイフン 2 個 */
const BACKUP_CODE_MAX_INPUT_LENGTH = 12;

const TOTP_DESCRIPTION =
  "認証アプリ（Google Authenticator 等）に表示されている 6 桁のコードを入力してください。";

const BACKUP_DESCRIPTION =
  "MFA 設定時に控えたバックアップコードを 1 件入力してください。各コードは 1 回だけ使えます。";

export function MfaVerifyClient() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    completeMfaVerification,
    initialState
  );
  const [mode, setMode] = useState<MfaVerifyMode>("totp");
  const [clientError, setClientError] = useState<string | null>(null);

  const isBackupMode = mode === "backup";

  // 入力を切り替えた直後に、前のモードのエラーが残らないようにする
  const serverError = state.mode === mode ? state.error : undefined;
  const displayError = clientError ?? serverError;

  // useActionState の成功は submit handler に戻らないため、ここで遷移する
  useEffect(() => {
    if (state.success) {
      router.push(ROUTES.subscriptions);
      router.refresh();
    }
  }, [router, state.success]);

  function handleModeChange(nextMode: MfaVerifyMode) {
    setMode(nextMode);
    setClientError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setClientError(null);

    const fieldName = isBackupMode ? "backupCode" : "token";
    const input = event.currentTarget.elements.namedItem(
      fieldName
    ) as HTMLInputElement | null;
    const value = input?.value.trim() ?? "";

    if (isBackupMode ? value.length === 0 : !TOKEN_PATTERN.test(value)) {
      event.preventDefault();
      setClientError(
        isBackupMode ? EMPTY_BACKUP_CODE_MESSAGE : INVALID_TOKEN_MESSAGE
      );
      return;
    }

    if (input) {
      input.value = value;
    }
  }

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <Card className={AUTH_CARD_MAX_WIDTH_CLASS}>
        <CardHeader className="text-center">
          <CardTitle>二段階認証</CardTitle>
          <CardDescription>
            {isBackupMode ? BACKUP_DESCRIPTION : TOTP_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={formAction}
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            <input type="hidden" name="mode" value={mode} />

            {isBackupMode ? (
              <div className="space-y-2">
                <Label htmlFor="mfa-verify-backup-code">
                  バックアップコード
                  <RequiredFieldMark />
                </Label>
                <Input
                  id="mfa-verify-backup-code"
                  name="backupCode"
                  type="text"
                  maxLength={BACKUP_CODE_MAX_INPUT_LENGTH}
                  autoComplete="one-time-code"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="XXXX-XXXX-XX"
                  aria-invalid={displayError ? true : undefined}
                  className="text-center font-mono text-lg tracking-widest uppercase"
                />
              </div>
            ) : (
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
            )}

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

            <Button
              type="button"
              variant="link"
              className="w-full"
              disabled={pending}
              onClick={() => handleModeChange(isBackupMode ? "totp" : "backup")}
            >
              {isBackupMode
                ? "認証アプリのコードを使う"
                : "バックアップコードを使う"}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              disabled={pending}
              onClick={() => signOut({ callbackUrl: ROUTES.login })}
            >
              ログイン画面に戻る
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
