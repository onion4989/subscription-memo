"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BACKUP_CODES_FILE_NAME = "subscmemo-backup-codes.txt";

const COPIED_LABEL_RESET_MS = 2000;

const BACKUP_CODES_FILE_NOTES = [
  "サブスクMEMO バックアップコード",
  "",
  "認証アプリが使えないとき、ログイン後の二段階認証画面で 1 件ずつ入力できます。",
  "各コードは 1 回だけ有効です。",
  "このファイルはパスワードマネージャー等の安全な場所へ移し、ダウンロードフォルダからは削除してください。",
  "",
];

export function buildBackupCodesFileContent(codes: readonly string[]): string {
  return `${BACKUP_CODES_FILE_NOTES.join("\n")}${codes.join("\n")}\n`;
}

type MfaBackupCodesViewProps = {
  codes: readonly string[];
  onDone?: () => void;
  doneLabel?: string;
};

export function MfaBackupCodesView({
  codes,
  onDone,
  doneLabel = "完了",
}: MfaBackupCodesViewProps) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  async function handleCopyCodes() {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_LABEL_RESET_MS);
    } catch {
      setCopied(false);
    }
  }

  function handleDownloadCodes() {
    const blob = new Blob([buildBackupCodesFileContent(codes)], {
      type: "text/plain;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = BACKUP_CODES_FILE_NAME;
    anchor.click();

    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center">
        <p className="text-lg font-semibold text-green-600">MFA設定完了</p>
        <p className="text-sm text-slate-600">
          次回ログイン時から、認証アプリの 6 桁コードが必要になります。
        </p>
      </div>

      <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-3">
        <p className="text-sm font-semibold text-amber-900">
          バックアップコードを保管してください
        </p>
        <p className="text-sm text-amber-900">
          スマートフォンの紛失・故障で認証アプリが使えないとき、このコードでログインできます。
          <strong className="font-semibold">
            この画面を閉じると二度と表示できません。
          </strong>
        </p>
        <p className="text-sm text-amber-900">
          スマートフォンとバックアップコードの両方を失うとログインできなくなります。パスワードマネージャーなど安全な場所に保管してください。
        </p>
      </div>

      <ul
        aria-label="バックアップコード一覧"
        className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-3"
      >
        {codes.map((code) => (
          <li
            key={code}
            className="text-center font-mono text-sm tracking-wider text-slate-800"
          >
            {code}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full border-slate-400 text-slate-800 hover:bg-slate-100"
          onClick={handleCopyCodes}
        >
          {copied ? <Check className="text-green-600" /> : <Copy />}
          {copied ? "コピーしました" : "すべてコピー"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-slate-400 text-slate-800 hover:bg-slate-100"
          onClick={handleDownloadCodes}
        >
          <Download />
          テキストで保存
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        各コードは 1 回だけ使えます。使い切った場合は、ログインしている状態で MFA
        を解除してから設定し直すと新しいコードを発行できます。
      </p>

      <div
        className={cn(
          "flex items-start gap-3 rounded-md border-2 px-3 py-3 transition-colors",
          // チェックで「完了」が押せるようになることを色でも伝える
          acknowledged
            ? "border-green-500 bg-green-50"
            : "border-slate-300 bg-slate-50"
        )}
      >
        <Checkbox
          id="mfa-backup-codes-acknowledged"
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked === true)}
          className="mt-0.5 size-5 border-slate-400"
        />
        <Label
          htmlFor="mfa-backup-codes-acknowledged"
          className="text-sm font-semibold text-slate-800"
        >
          バックアップコードを控えました
        </Label>
      </div>

      {onDone ? (
        <Button
          type="button"
          className="w-full"
          disabled={!acknowledged}
          onClick={onDone}
        >
          {doneLabel}
        </Button>
      ) : null}
    </div>
  );
}
