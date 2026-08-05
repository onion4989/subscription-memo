"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

type SubscriptionDeleteConfirmModalProps = {
  open: boolean;
  target: SavedSubscriptionRow | null;
  errorMessage?: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function SubscriptionDeleteConfirmModal({
  open,
  target,
  errorMessage,
  isDeleting,
  onOpenChange,
  onConfirm,
}: SubscriptionDeleteConfirmModalProps) {
  const deleteLabel = isDeleting ? "削除中..." : "削除する";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="border-white/20 bg-[#3D3D3D] text-white sm:max-w-md"
        closeButtonClassName="top-4 right-4 max-sm:top-3 max-sm:right-3"
      >
        <DialogHeader className="gap-6">
          <DialogTitle className="text-white">データ削除</DialogTitle>
          <DialogDescription className="text-white/80">
            {target ? (
              <>
                「{target.name}」（{target.planName}）を削除しますか？
                <br />
                この操作は取り消せません。
              </>
            ) : (
              "削除対象を読み込み中です。"
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage ? (
          <p className="text-sm text-red-300">{errorMessage}</p>
        ) : null}

        <DialogFooter className="flex-col gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting || !target}
            className="bg-[var(--app-action-danger)] font-bold text-white hover:bg-[var(--app-action-danger-hover)]"
          >
            {deleteLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
