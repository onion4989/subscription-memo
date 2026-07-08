"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { disableMfa, type MfaDisableState } from "@/lib/actions/mfa-disable";
import { MFA_SETTINGS_BUTTON_CLASS } from "@/components/features/settings/mfa-settings-shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: MfaDisableState = { success: false };

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-red-300" role="alert">
      {message}
    </p>
  );
}

export function MfaDisableDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(disableMfa, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setFormKey((current) => current + 1);
      router.refresh();
    }
  }, [router, state.success]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setFormKey((current) => current + 1);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        className={MFA_SETTINGS_BUTTON_CLASS}
        onClick={() => handleOpenChange(true)}
      >
        MFA を解除する
      </Button>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>二段階認証（MFA）の解除</DialogTitle>
          <DialogDescription>
            二段階認証を解除します。解除後は、ログイン時に認証アプリのコードは不要になります。
          </DialogDescription>
        </DialogHeader>

        <form key={formKey} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-disable-password">現在のパスワード</Label>
            <Input
              id="mfa-disable-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
            />
          </div>

          <FieldError message={state.error} />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              className={cn(pending && "opacity-70")}
            >
              {pending ? "解除中..." : "解除する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
