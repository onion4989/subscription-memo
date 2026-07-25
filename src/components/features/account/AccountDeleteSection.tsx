"use client";

import { useActionState, useState } from "react";
import {
  deleteAccount,
  type DeleteAccountState,
} from "@/lib/actions/delete-account";
import { ACCOUNT_DELETE_CONFIRMATION_PHRASE } from "@/lib/account-deletion/constants";
import {
  FORM_FIELD_HINT_CLASS,
  FORM_PANEL_CLASS,
} from "@/components/features/app-form-styles";
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
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const TRIGGER_BUTTON_CLASS =
  "border-red-400/60 bg-transparent text-red-300 hover:bg-red-500/20 hover:text-red-200";

const initialState: DeleteAccountState = { success: false };

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

type AccountDeleteSectionProps = {
  hasPassword: boolean;
};

export function AccountDeleteSection({ hasPassword }: AccountDeleteSectionProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialState
  );
  const hydrated = useHydrated();
  const viewState = hydrated ? state : initialState;
  const isPending = hydrated && pending;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setFormKey((current) => current + 1);
    }
  }

  return (
    <section className={FORM_PANEL_CLASS}>
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold">アカウントを削除する</h2>
          <p className={cn("mt-1", FORM_FIELD_HINT_CLASS)}>
            アカウントを削除すると、プロフィールや登録済みのサブスクリプションなど、すべてのデータが削除されます。
          </p>
          <p className="mt-3 text-sm font-medium text-red-300" role="note">
            この操作は取り消せません。削除後は同じアカウントでログインできなくなります。
          </p>
        </div>

        <div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button
              type="button"
              variant="outline"
              className={TRIGGER_BUTTON_CLASS}
              onClick={() => handleOpenChange(true)}
            >
              アカウントを削除する
            </Button>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>アカウントを削除する</DialogTitle>
                <DialogDescription>
                  アカウントと関連データを完全に削除します。この操作は取り消せません。
                </DialogDescription>
              </DialogHeader>

              <p className="text-sm font-medium text-red-600">
                削除が完了すると、登録データは復元できません。確認のうえ実行してください。
              </p>

              <form key={formKey} action={formAction} className="space-y-4">
                {hasPassword ? (
                  <div className="space-y-2">
                    <Label htmlFor="account-delete-password">
                      現在のパスワード
                    </Label>
                    <Input
                      id="account-delete-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      disabled={isPending}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="account-delete-confirmation">
                      確認のため「{ACCOUNT_DELETE_CONFIRMATION_PHRASE}
                      」と入力してください
                    </Label>
                    <Input
                      id="account-delete-confirmation"
                      name="confirmationPhrase"
                      type="text"
                      autoComplete="off"
                      required
                      disabled={isPending}
                      placeholder={ACCOUNT_DELETE_CONFIRMATION_PHRASE}
                    />
                  </div>
                )}

                <FieldError message={viewState.error} />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleOpenChange(false)}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isPending}
                    className={cn(isPending && "opacity-70")}
                  >
                    {isPending ? "削除中..." : "アカウントを削除する"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
