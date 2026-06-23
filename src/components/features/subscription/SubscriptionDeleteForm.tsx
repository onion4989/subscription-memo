"use client";

import { useState, useTransition } from "react";
import { SubscriptionDeleteConfirmModal } from "@/components/features/subscription/SubscriptionDeleteConfirmModal";
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

  if (rows.length === 0) {
    return (
      <p className="text-base text-white/90">登録されたデータはありません。</p>
    );
  }

  return (
    <>
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
