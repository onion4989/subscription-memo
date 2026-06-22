"use client";

import { useState, useTransition } from "react";
import { FaPlus } from "react-icons/fa6";
import { SubscriptionFormModal } from "@/components/features/subscription/SubscriptionFormModal";
import {
  registerSubscription,
  updateSubscription,
} from "@/lib/actions/subscription-register";
import {
  PAYMENT_PLAN_LABELS,
  SUBSCRIPTION_MAX_ROWS,
} from "@/lib/subscription/constants";
import {
  formatContractDateYmd,
  formatYenAmount,
} from "@/lib/subscription/format";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import {
  EMPTY_SUBSCRIPTION_FORM_VALUES,
  subscriptionFormValuesFromSaved,
  type SubscriptionRegisterFieldErrors,
  type SubscriptionRegisterFormValues,
} from "@/schemas/subscription";
import { Button } from "@/components/ui/button";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const TABLE_GRID_CLASS =
  "grid w-max min-w-full grid-cols-[160px_80px_110px_70px_88px_100px_100px_64px_80px] gap-x-2 gap-y-3";

const TABLE_COLUMNS = [
  { label: "サブスクリプション名", centered: false },
  { label: "プラン名", centered: false },
  { label: "支払いプラン", centered: true },
  { label: "月額", centered: true },
  { label: "年額", centered: true },
  { label: "契約日", centered: true },
  { label: "次回更新日", centered: true },
  { label: "お知らせ", centered: true },
  { label: "修正", centered: true },
] as const;

type SubscriptionRegistrationFormProps = {
  initialSaved: SavedSubscriptionRow[];
};

type ModalMode = "create" | "edit";

function SavedCell({
  children,
  truncate = false,
  centered = false,
}: {
  children: React.ReactNode;
  truncate?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-9 min-w-0 items-center px-1 text-sm text-white",
        centered ? "justify-center text-center" : "",
        truncate && "truncate"
      )}
      title={truncate && typeof children === "string" ? children : undefined}
    >
      {children}
    </div>
  );
}

function SubscriptionSavedRow({
  row,
  onEdit,
}: {
  row: SavedSubscriptionRow;
  onEdit: (subscriptionId: string) => void;
}) {
  return (
    <>
      <SavedCell>{row.name}</SavedCell>
      <SavedCell truncate>{row.planName}</SavedCell>
      <SavedCell centered>{PAYMENT_PLAN_LABELS[row.paymentPlan]}</SavedCell>
      <SavedCell centered>{formatYenAmount(row.monthlyAmount)}</SavedCell>
      <SavedCell centered>{formatYenAmount(row.annualAmount)}</SavedCell>
      <SavedCell centered truncate>
        {formatContractDateYmd(row.contractDate)}
      </SavedCell>
      <SavedCell centered truncate>
        {formatContractDateYmd(row.nextRenewalDate)}
      </SavedCell>
      <SavedCell centered>{row.notifyEnabled ? "ON" : "—"}</SavedCell>
      <div className="flex min-h-9 items-center justify-center px-1">
        <Button
          type="button"
          onClick={() => onEdit(row.id)}
          className="h-9 w-[72px] bg-[#8A2082] px-0 text-white hover:bg-[#74206E]"
        >
          修正
        </Button>
      </div>
    </>
  );
}

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
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className={APP_SCROLLBAR_X_CLASS}>
        <div className={TABLE_GRID_CLASS}>
          {TABLE_COLUMNS.map((column) => (
            <div
              key={column.label}
              className={cn(
                "px-1 text-sm font-semibold text-white",
                column.centered && "text-center"
              )}
            >
              {column.label}
            </div>
          ))}

          <div
            className="col-span-full h-px bg-white"
            aria-hidden="true"
          />

          {rows.map((row) => (
            <SubscriptionSavedRow
              key={row.id}
              row={row}
              onEdit={openEditModal}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={openCreateModal}
        disabled={!canAddRow}
        className="inline-flex items-center gap-2 self-start text-sm font-medium text-white transition-opacity enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FaPlus aria-hidden="true" />
        追加
      </button>

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
    </div>
  );
}
