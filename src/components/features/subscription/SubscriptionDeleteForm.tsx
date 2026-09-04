"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SubscriptionDeleteConfirmModal } from "@/components/features/subscription/SubscriptionDeleteConfirmModal";
import { SubscriptionMobileList } from "@/components/features/subscription/SubscriptionMobileList";
import {
  SUBSCRIPTION_TABLE_FRAME_DATA_ATTR,
  SUB_TABLE_SCROLL_AREA_CLASS,
  SUB_TABLE_SECTION_FRAME_CLASS,
  SubscriptionTableSection,
} from "@/components/features/subscription/SubscriptionTableSection";
import {
  DELETE_COLUMN_FADE_CLASS,
  DELETE_COLUMN_FADE_MS,
  ENABLE_DELETE_COLUMN_ANIMATION,
  SubscriptionTransposeTable,
} from "@/components/features/subscription/subscription-table-shared";
import { SubscriptionTableScrollArea } from "@/components/features/subscription/SubscriptionTableScrollArea";
import { deleteSubscription } from "@/lib/actions/subscription-delete";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

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
  const [removingSubId, setRemovingSubId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 削除フェード用 setTimeout のアンマウント時 cleanup（タイマー保険）
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

  const isRemovalInProgress = removingSubId !== null;

  const openDeleteModal = (subscriptionId: string) => {
    if (removingSubId !== null) {
      return;
    }

    setDeleteTargetId(subscriptionId);
    setErrorMessage(undefined);
    setModalOpen(true);
  };

  const onModalOpenChange = (open: boolean) => {
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
    setRemovingSubId(null);
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

      setRemovingSubId(idToRemove);

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
          <p className="pt-4 text-[14px] text-[color:var(--app-fg)]/90 md:pt-6 md:text-base">
            登録済みのサブスクリプションを削除できます。
          </p>
          <h2 className="text-[24px] font-bold text-[color:var(--app-fg)]">
            登録されたデータはありません。
          </h2>
        </div>
      ) : (
        <SubscriptionTableSection
          description={
            <p className="py-4 text-[14px] text-[color:var(--app-fg)]/90 md:py-6 md:text-base">
              登録済みのサブスクリプションを削除できます。
            </p>
          }
        >
          <div className="w-full md:hidden">
            <SubscriptionMobileList
              subscriptions={rows}
              guideText="削除したいサブスクリプションのカードをタップしてください。"
              onCardPress={openDeleteModal}
              pressActionLabel="削除"
              cardDisabled={isRemovalInProgress}
              getCardClassName={(subscriptionId) =>
                subscriptionId === removingSubId
                  ? DELETE_COLUMN_FADE_CLASS
                  : undefined
              }
            />
          </div>

          <div
            className={`hidden w-full items-center justify-center md:flex ${SUB_TABLE_SECTION_FRAME_CLASS}`}
            {...{ [SUBSCRIPTION_TABLE_FRAME_DATA_ATTR]: "" }}
          >
            <SubscriptionTableScrollArea
              className={cn(
                APP_SCROLLBAR_X_CLASS,
                SUB_TABLE_SCROLL_AREA_CLASS
              )}
            >
              <SubscriptionTransposeTable
                subscriptions={rows}
                action="delete"
                onDelete={openDeleteModal}
                removingSubId={removingSubId}
              />
            </SubscriptionTableScrollArea>
          </div>
        </SubscriptionTableSection>
      )}

      <SubscriptionDeleteConfirmModal
        open={modalOpen}
        target={deleteTarget}
        errorMessage={errorMessage}
        isDeleting={isPending}
        onOpenChange={onModalOpenChange}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
