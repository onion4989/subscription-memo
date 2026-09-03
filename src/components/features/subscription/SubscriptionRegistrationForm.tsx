"use client";

import { useState, useTransition } from "react";
import { FaPlus } from "react-icons/fa6";
import { AddColumnGuideArrow } from "@/components/features/subscription/AddColumnGuideArrow";
import { SubscriptionFormModal } from "@/components/features/subscription/SubscriptionFormModal";
import { SubscriptionMobileList } from "@/components/features/subscription/SubscriptionMobileList";
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
  SUBSCRIPTION_SECTION_FRAME_CLASS,
  SUBSCRIPTION_TABLE_FRAME_DATA_ATTR,
  SUB_TABLE_SCROLL_AREA_CLASS,
  SUB_TABLE_SECTION_FRAME_CLASS,
} from "@/components/features/subscription/SubscriptionTableSection";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

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
  const [editingSubId, setEditingSubId] = useState<
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
    setEditingSubId(null);
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
    setEditingSubId(subscriptionId);
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
        modalMode === "edit" && editingSubId
          ? await updateSubscription(editingSubId, formValues)
          : await registerSubscription(formValues);

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormMessage(result.message);
        return;
      }

      if (modalMode === "edit" && editingSubId) {
        setRows((currentRows) =>
          currentRows.map((row) =>
            row.id === editingSubId ? result.subscription : row
          )
        );
      } else {
        setRows((currentRows) => [...currentRows, result.subscription]);
      }

      setModalOpen(false);
    });
  };

  const onModalOpenChange = (open: boolean) => {
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
      className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--app-fg)] transition-opacity enabled:cursor-pointer enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FaPlus aria-hidden="true" />
      追加
    </button>
  );

  return (
    <>
      <div className={SUBSCRIPTION_PAGE_CONTENT_CLASS}>
        <div className="py-4 text-[14px] text-[color:var(--app-fg)]/90 md:py-6 md:text-base">
          <p>サブスクリプションの情報を登録することができます。</p>
          <p>
            <span className="inline-flex items-center gap-1 rounded-[2px] bg-white/25 px-1.5 py-0.5 font-medium text-[color:var(--app-fg)]">
              <FaPlus className="text-xs" aria-hidden="true" />
              追加ボタン
            </span>
            {" "}からデータを入力してください。
          </p>
        </div>

        <div className="w-full md:hidden">
          {rows.length > 0 ? (
            <SubscriptionMobileList
              subscriptions={rows}
              guideText="変更したいサブスクリプションのカードをタップしてください。"
              onCardPress={openEditModal}
            />
          ) : null}
          <div className="flex justify-center pt-4">{addButton}</div>
        </div>

        <div
          className={cn(
            "hidden w-full items-center justify-center md:flex",
            rows.length === 0
              ? SUBSCRIPTION_SECTION_FRAME_CLASS
              : SUB_TABLE_SECTION_FRAME_CLASS
          )}
          {...{ [SUBSCRIPTION_TABLE_FRAME_DATA_ATTR]: "" }}
        >
          <div
            className={cn(
              "max-w-full",
              rows.length > 0 && APP_SCROLLBAR_X_CLASS,
              rows.length > 0 && SUB_TABLE_SCROLL_AREA_CLASS
            )}
          >
            {/*
              テーブル・追加ボタン・ガイド矢印を同一 w-max 箱に入れ、
              横スクロール時も相対位置がずれないようにする。
            */}
            <div
              className={cn(
                "relative w-max",
                showAddColumnGuide && "pr-[60px]"
              )}
            >
              <SubscriptionTransposeTable
                subscriptions={rows}
                action="edit"
                onEdit={openEditModal}
              />

              <div
                className={cn(
                  "flex w-full justify-center",
                  rows.length > 0 && "mt-4"
                )}
              >
                {addButton}
              </div>

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
        onOpenChange={onModalOpenChange}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </>
  );
}
