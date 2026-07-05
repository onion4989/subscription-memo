"use client";

import { useState, useTransition } from "react";
import { FaPlus } from "react-icons/fa6";
import { SubscriptionFormModal } from "@/components/features/subscription/SubscriptionFormModal";
import {
  SUBSCRIPTION_REGISTER_TABLE_COLUMNS,
  SUBSCRIPTION_REGISTER_TABLE_GRID_CLASS,
  SubscriptionTableHeader,
  SubscriptionTableRow,
} from "@/components/features/subscription/subscription-table-shared";
import {
  registerSubscription,
  updateSubscription,
} from "@/lib/actions/subscription-register";
import { SUBSCRIPTION_MAX_ROWS } from "@/lib/subscription/constants";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import {
  EMPTY_SUBSCRIPTION_FORM_VALUES,
  subscriptionFormValuesFromSaved,
  type SubscriptionRegisterFieldErrors,
  type SubscriptionRegisterFormValues,
} from "@/schemas/subscription";
import {
  SUBSCRIPTION_PAGE_CONTENT_CLASS,
  SUBSCRIPTION_TABLE_BLOCK_CLASS,
} from "@/components/features/subscription/SubscriptionTableSection";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

type SubscriptionRegistrationFormProps = {
  initialSaved: SavedSubscriptionRow[];
};

type ModalMode = "create" | "edit";

export function SubscriptionRegistrationForm({
  initialSaved,
}: SubscriptionRegistrationFormProps) {
  const [rows, setRows] = useState<SavedSubscriptionRow[]>(initialSaved);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<
    string | null
  >(null);
  const [formValues, setFormValues] = useState<SubscriptionRegisterFormValues>({
    ...EMPTY_SUBSCRIPTION_FORM_VALUES,
  });
  const [fieldErrors, setFieldErrors] = useState<SubscriptionRegisterFieldErrors>(
    {}
  );
  const [formMessage, setFormMessage] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const canAddRow = rows.length < SUBSCRIPTION_MAX_ROWS;

  const openCreateModal = () => {
    setModalMode("create");
    setEditingSubscriptionId(null);
    setFormValues({ ...EMPTY_SUBSCRIPTION_FORM_VALUES });
    setFieldErrors({});
    setFormMessage(undefined);
    setModalOpen(true);
  };

  const openEditModal = (subscriptionId: string) => {
    const targetRow = rows.find((row) => row.id === subscriptionId);

    if (!targetRow) {
      return;
    }

    setModalMode("edit");
    setEditingSubscriptionId(subscriptionId);
    setFormValues(subscriptionFormValuesFromSaved(targetRow));
    setFieldErrors({});
    setFormMessage(undefined);
    setModalOpen(true);
  };

  const handleFormChange = (patch: Partial<SubscriptionRegisterFormValues>) => {
    setFormValues((currentValues) => ({ ...currentValues, ...patch }));
    setFieldErrors({});
    setFormMessage(undefined);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result =
        modalMode === "edit" && editingSubscriptionId
          ? await updateSubscription(editingSubscriptionId, formValues)
          : await registerSubscription(formValues);

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormMessage(result.message);
        return;
      }

      if (modalMode === "edit" && editingSubscriptionId) {
        setRows((currentRows) =>
          currentRows.map((row) =>
            row.id === editingSubscriptionId ? result.subscription : row
          )
        );
      } else {
        setRows((currentRows) => [...currentRows, result.subscription]);
      }

      setModalOpen(false);
    });
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);

    if (!open) {
      setFieldErrors({});
      setFormMessage(undefined);
    }
  };

  return (
    <>
      <div className={APP_SCROLLBAR_X_CLASS}>
        <div className={SUBSCRIPTION_PAGE_CONTENT_CLASS}>
          <div className="py-6 text-base text-white/90">
            <p>下記の追加ボタンからデータを入力してください。</p>
            <p>+追加ボタン からデータを入力してください。</p>
          </div>

          <div className={`${SUBSCRIPTION_TABLE_BLOCK_CLASS} gap-4`}>
            <div className={SUBSCRIPTION_REGISTER_TABLE_GRID_CLASS}>
              <SubscriptionTableHeader columns={SUBSCRIPTION_REGISTER_TABLE_COLUMNS} />

              {rows.map((row) => (
                <SubscriptionTableRow key={row.id} row={row} onEdit={openEditModal} />
              ))}
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={!canAddRow}
              className="inline-flex items-center gap-2 text-sm font-medium text-white transition-opacity enabled:cursor-pointer enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaPlus aria-hidden="true" />
              追加
            </button>
          </div>
        </div>
      </div>

      <SubscriptionFormModal
        open={modalOpen}
        mode={modalMode}
        values={formValues}
        fieldErrors={fieldErrors}
        formMessage={formMessage}
        isSubmitting={isPending}
        onOpenChange={handleModalOpenChange}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </>
  );
}
