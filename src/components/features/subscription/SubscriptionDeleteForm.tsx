"use client";

import { useState, useTransition } from "react";
import { SubscriptionDeleteConfirmModal } from "@/components/features/subscription/SubscriptionDeleteConfirmModal";
import {
  SUBSCRIPTION_TABLE_WIDTH_CONTAINER_CLASS,
  SubscriptionTableSection,
} from "@/components/features/subscription/SubscriptionTableSection";
import {
  SUBSCRIPTION_DELETE_TABLE_COLUMNS,
  SUBSCRIPTION_DELETE_TABLE_GRID_CLASS,
  SubscriptionTableHeader,
  SubscriptionTableRow,
} from "@/components/features/subscription/subscription-table-shared";
import { deleteSubscription } from "@/lib/actions/subscription-delete";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

type SubscriptionDeleteFormProps = {
  initialSaved: SavedSubscriptionRow[];
};

export function SubscriptionDeleteForm({
  initialSaved,
}: SubscriptionDeleteFormProps) {
  const [rows, setRows] = useState<SavedSubscriptionRow[]>(initialSaved);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const deleteTarget =
    deleteTargetId === null
      ? null
      : (rows.find((row) => row.id === deleteTargetId) ?? null);

  const openDeleteModal = (subscriptionId: string) => {
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

  const handleConfirmDelete = () => {
    if (!deleteTargetId) {
      return;
    }

    startTransition(async () => {
      const result = await deleteSubscription(deleteTargetId);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setRows((currentRows) =>
        currentRows.filter((row) => row.id !== deleteTargetId)
      );
      setModalOpen(false);
      setDeleteTargetId(null);
      setErrorMessage(undefined);
    });
  };

  return (
    <>
      {rows.length === 0 ? (
        <div className="flex w-full flex-col space-y-4">
          <p className="py-6 text-base text-white/90">
            登録済みのサブスクリプションを削除できます。
          </p>
          <h2 className="text-[36px] font-bold text-white">
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
            <div className={SUBSCRIPTION_DELETE_TABLE_GRID_CLASS}>
              <SubscriptionTableHeader columns={SUBSCRIPTION_DELETE_TABLE_COLUMNS} />

              {rows.map((row) => (
                <SubscriptionTableRow
                  key={row.id}
                  row={row}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
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
