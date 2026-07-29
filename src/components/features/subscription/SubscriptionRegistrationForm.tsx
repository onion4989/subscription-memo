"use client";

import { useState, useTransition } from "react";
import { FaPlus } from "react-icons/fa6";
import { AddColumnGuideArrow } from "@/components/features/subscription/AddColumnGuideArrow";
import { SubscriptionFormModal } from "@/components/features/subscription/SubscriptionFormModal";
import { SubscriptionMobileCard } from "@/components/features/subscription/SubscriptionMobileCard";
import { SubscriptionTransposeTable } from "@/components/features/subscription/subscription-table-shared";
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
  SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS,
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
  const showAddColumnGuide = rows.length > 0 && canAddRow;

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

  const addButton = (
    <button
      type="button"
      onClick={openCreateModal}
      disabled={!canAddRow}
      className="inline-flex items-center gap-2 text-sm font-medium text-white transition-opacity enabled:cursor-pointer enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FaPlus aria-hidden="true" />
      追加
    </button>
  );

  return (
    <>
      <div className={SUBSCRIPTION_PAGE_CONTENT_CLASS}>
        <div className="py-6 text-base text-white/90">
          <p>サブスクリプションの情報を登録することができます。</p>
          <p>
            <span className="inline-flex items-center gap-1 rounded-[2px] bg-white/25 px-1.5 py-0.5 font-medium text-white">
              <FaPlus className="text-xs" aria-hidden="true" />
              追加ボタン
            </span>
            {" "}からデータを入力してください。
          </p>
        </div>

        <div className="w-full space-y-3 md:hidden">
          {rows.map((subscription) => (
            <SubscriptionMobileCard
              key={subscription.id}
              subscription={subscription}
              action={{
                label: "修正",
                onClick: () => openEditModal(subscription.id),
              }}
            />
          ))}
          <div className="flex justify-center pt-1">{addButton}</div>
        </div>

        <div
          className={`hidden w-full items-center justify-center md:flex ${SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS}`}
        >
          <div className={`max-w-full ${APP_SCROLLBAR_X_CLASS}`}>
            {/*
              テーブル・追加ボタン・ガイド矢印を同一 w-max 箱に入れ、
              横スクロール時も相対位置がずれないようにする。
            */}
            <div className="relative w-max pr-[60px]">
              <SubscriptionTransposeTable
                subscriptions={rows}
                action="edit"
                onEdit={openEditModal}
              />

              <div className="mt-4 flex w-full justify-center">{addButton}</div>

              {/* 外側 relative（pr 含む）に置き、テーブル幅+60px まで線が届くようにする */}
              {showAddColumnGuide ? <AddColumnGuideArrow /> : null}
            </div>
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
