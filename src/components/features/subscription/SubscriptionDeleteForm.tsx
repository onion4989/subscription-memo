"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SubscriptionDeleteConfirmModal } from "@/components/features/subscription/SubscriptionDeleteConfirmModal";
import {
  SUBSCRIPTION_TABLE_WIDTH_CONTAINER_CLASS,
  SubscriptionTableSection,
} from "@/components/features/subscription/SubscriptionTableSection";
import {
  DELETE_COLUMN_FADE_MS,
  ENABLE_DELETE_COLUMN_ANIMATION,
  SubscriptionTransposeTable,
} from "@/components/features/subscription/subscription-table-shared";
import { deleteSubscription } from "@/lib/actions/subscription-delete";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

type SubscriptionDeleteFormProps = {
  initialSaved: SavedSubscriptionRow[];
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SubscriptionDeleteForm({
  initialSaved,
}: SubscriptionDeleteFormProps) {
  const [rows, setRows] = useState<SavedSubscriptionRow[]>(initialSaved);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [removingSubscriptionId, setRemovingSubscriptionId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current !== null) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const deleteTarget =
    deleteTargetId === null
      ? null
      : (rows.find((row) => row.id === deleteTargetId) ?? null);

  const openDeleteModal = (subscriptionId: string) => {
    if (removingSubscriptionId !== null) {
      return;
    }

    setDeleteTargetId(subscriptionId);
    setErrorMessage(undefined);
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);

    if (!open) {
      setDeleteTargetId(null);
      setErrorMessage(undefined);
    }
  };

  const removeRowImmediately = (subscriptionId: string) => {
    setRows((currentRows) =>
      currentRows.filter((row) => row.id !== subscriptionId)
    );
    setRemovingSubscriptionId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) {
      return;
    }

    const idToRemove = deleteTargetId;

    startTransition(async () => {
      const result = await deleteSubscription(idToRemove);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setModalOpen(false);
      setDeleteTargetId(null);
      setErrorMessage(undefined);

      const skipAnimation =
        !ENABLE_DELETE_COLUMN_ANIMATION || prefersReducedMotion();

      if (skipAnimation) {
        removeRowImmediately(idToRemove);
        return;
      }

      setRemovingSubscriptionId(idToRemove);

      await new Promise<void>((resolve) => {
        fadeTimeoutRef.current = setTimeout(() => {
          fadeTimeoutRef.current = null;
          resolve();
        }, DELETE_COLUMN_FADE_MS);
      });

      removeRowImmediately(idToRemove);
    });
  };

  return (
    <>
      {rows.length === 0 ? (
        <div className="flex w-full flex-col space-y-4">
          <p className="pt-6 text-base text-white/90">
            登録済みのサブスクリプションを削除できます。
          </p>
          <h2 className="text-[24px] font-bold text-white">
            登録されたデータはありません。
          </h2>
        </div>
      ) : (
        <SubscriptionTableSection
          description={
            <p className="py-6 text-base text-white/90">
              登録済みのサブスクリプションを削除できます。
            </p>
          }
          tableBlockClassName={`${SUBSCRIPTION_TABLE_WIDTH_CONTAINER_CLASS} gap-4`}
        >
          <div className={APP_SCROLLBAR_X_CLASS}>
            <SubscriptionTransposeTable
              subscriptions={rows}
              action="delete"
              onDelete={openDeleteModal}
              removingSubscriptionId={removingSubscriptionId}
            />
          </div>
        </SubscriptionTableSection>
      )}

      <SubscriptionDeleteConfirmModal
        open={modalOpen}
        target={deleteTarget}
        errorMessage={errorMessage}
        isDeleting={isPending}
        onOpenChange={handleModalOpenChange}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
