"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { MfaSetupState } from "@/lib/actions/mfa-setup";
import { TOTP_ISSUER } from "@/lib/mfa/totp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMark } from "@/components/features/auth/RequiredFieldMark";

export const MFA_QR_SIZE_PX = 200;

export const MFA_SETUP_ENROLLMENT_DESCRIPTION =
  "Google Authenticator 等の認証アプリで QR コードを読み取るか、手動でキーを登録し、表示される 6 桁のコードを入力してください。";

type MfaManualEntryFallbackProps = {
  email: string;
  secret: string;
};

export function MfaManualEntryFallback({
  email,
  secret,
}: MfaManualEntryFallbackProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopySecret() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="rounded-md border border-slate-200 bg-slate-50 text-sm">
      <summary className="cursor-pointer px-3 py-2 font-medium text-slate-700">
        QR を読み取れない場合（手動入力）
      </summary>
      <div className="space-y-3 border-t border-slate-200 px-3 py-3 text-slate-600">
        <p>認証アプリの「キーを入力」に、次の情報を登録してください。</p>
        <dl className="space-y-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">アカウント</dt>
            <dd className="break-all font-mono text-xs">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">発行者</dt>
            <dd className="font-mono text-xs">{TOTP_ISSUER}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">キー</dt>
            <dd className="break-all font-mono text-xs">{secret}</dd>
          </div>
        </dl>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopySecret}
        >
          {copied ? "コピーしました" : "キーをコピー"}
        </Button>
      </div>
    </details>
  );
}

type MfaEnrollmentPanelProps = {
  setupData: MfaSetupState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  error?: string;
  tokenInputId?: string;
};

export function MfaEnrollmentPanel({
  setupData,
  formAction,
  pending,
  error,
  tokenInputId = "mfa-setup-token",
}: MfaEnrollmentPanelProps) {
  const { uri, secret, email } = setupData;

  if (!uri || !secret || !email) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <QRCodeSVG
            value={uri}
            size={MFA_QR_SIZE_PX}
            role="img"
            aria-label="二段階認証の設定用 QR コード"
          />
        </div>
        <p className="text-center text-xs text-slate-500">
          PC で設定する場合は、スマホの認証アプリで QR コードを読み取ってください。
        </p>
      </div>

      <MfaManualEntryFallback email={email} secret={secret} />

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="secret" value={secret} />
        <input type="hidden" name="uri" value={uri} />
        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <Label htmlFor={tokenInputId}>
            認証コード（6桁）
            <RequiredFieldMark />
          </Label>
          <Input
            id={tokenInputId}
            name="token"
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            autoComplete="one-time-code"
            className="text-center text-lg tracking-widest"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "確認中..." : "設定を確定"}
        </Button>
      </form>
    </div>
  );
}

type MfaSetupCompleteViewProps = {
  onDone?: () => void;
  doneLabel?: string;
};

export function MfaSetupCompleteView({
  onDone,
  doneLabel = "完了",
}: MfaSetupCompleteViewProps) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-lg font-semibold text-green-600">MFA設定完了</p>
      <p className="text-sm text-slate-600">
        次回ログイン時から、認証アプリの 6 桁コードが必要になります。
      </p>
      <p className="text-sm text-slate-600">
        認証アプリを削除したり端末を変更した場合は、再度設定が必要です。
      </p>
      {onDone ? (
        <Button type="button" onClick={onDone} className="w-full">
          {doneLabel}
        </Button>
      ) : null}
    </div>
  );
}
