"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { initMfaSetup, type MfaSetupState } from "@/lib/actions/mfa-setup";
import { MfaSetupFlow } from "@/components/features/mfa/MfaSetupFlow";
import { MFA_SETUP_ENROLLMENT_DESCRIPTION } from "@/components/features/mfa/mfa-setup-shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MFA_SETTINGS_BUTTON_CLASS } from "@/components/features/settings/mfa-settings-shared";
import { cn } from "@/lib/utils";

type MfaSettingsDialogProps = {
  totpEnabled: boolean;
};

export function MfaSettingsDialog({ totpEnabled }: MfaSettingsDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(totpEnabled);
  const [setupData, setSetupData] = useState<MfaSetupState | null>(null);
  const [isLoadingSetup, startLoadingSetup] = useTransition();

  useEffect(() => {
    setMfaEnabled(totpEnabled);
  }, [totpEnabled]);

  const loadSetupData = useCallback(() => {
    startLoadingSetup(async () => {
      const data = await initMfaSetup();
      setSetupData(data);
    });
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && !mfaEnabled) {
      setSetupData(null);
      loadSetupData();
    }
    if (!nextOpen) {
      setSetupData(null);
    }
  }

  function handleSetupComplete() {
    setMfaEnabled(true);
    setOpen(false);
    setSetupData(null);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        className={cn(MFA_SETTINGS_BUTTON_CLASS, "gap-2")}
        onClick={() => handleOpenChange(true)}
      >
        {mfaEnabled ? (
          <CheckCircle2
            className="size-4 shrink-0 text-emerald-400"
            aria-hidden
          />
        ) : null}
        MFA を設定する
      </Button>

      <DialogContent className="max-h-[min(90vh,48rem)] overflow-y-auto sm:max-w-lg">
        {mfaEnabled ? (
          <>
            <DialogHeader>
              <DialogTitle>二段階認証（MFA）</DialogTitle>
              <DialogDescription>
                二段階認証は有効です。ログイン時に認証アプリの 6 桁コードが必要です。
              </DialogDescription>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>MFA設定</DialogTitle>
              <DialogDescription>
                {MFA_SETUP_ENROLLMENT_DESCRIPTION}
              </DialogDescription>
            </DialogHeader>
            {isLoadingSetup || !setupData ? (
              <p className="text-center text-sm text-muted-foreground">
                読み込み中...
              </p>
            ) : (
              <MfaSetupFlow
                key={setupData.uri ?? "mfa-setup"}
                initialSetupData={setupData}
                tokenInputId="mfa-settings-dialog-token"
                autoNotifyOnComplete
                onComplete={handleSetupComplete}
                onCancel={() => handleOpenChange(false)}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
