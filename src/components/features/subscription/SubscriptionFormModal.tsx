"use client";

import { useMemo, useRef } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openNativeDatePicker } from "@/lib/dom/open-native-date-picker";
import {
  PAYMENT_PLAN_LABELS,
  SUBSCRIPTION_NAME_MAX_LENGTH,
  SUBSCRIPTION_PLAN_NAME_MAX_LENGTH,
} from "@/lib/subscription/constants";
import { formatContractDateYmd } from "@/lib/subscription/format";
import {
  sanitizeAmountInput,
  syncAnnualFromMonthly,
  syncMonthlyFromAnnual,
} from "@/lib/subscription/amount-sync";
import {
  computeNextRenewalDateYmd,
  todayYmdInJst,
} from "@/lib/subscription/renewal-date";
import { cn } from "@/lib/utils";
import type {
  SubscriptionRegisterFieldErrors,
  SubscriptionRegisterFormValues,
} from "@/schemas/subscription";

const FIELD_INPUT_CLASS =
  "h-9 min-w-0 bg-white text-slate-900 placeholder:text-slate-400";

type SubscriptionFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  values: SubscriptionRegisterFormValues;
  fieldErrors: SubscriptionRegisterFieldErrors;
  formMessage?: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (patch: Partial<SubscriptionRegisterFormValues>) => void;
  onSubmit: () => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-300">{message}</p>;
}

function getNextRenewalPreview(values: SubscriptionRegisterFormValues): string {
  if (!values.contractDate || !values.paymentPlan) {
    return "※自動計算";
  }

  return formatContractDateYmd(
    computeNextRenewalDateYmd(
      values.contractDate,
      values.paymentPlan,
      todayYmdInJst()
    )
  );
}

export function SubscriptionFormModal({
  open,
  mode,
  values,
  fieldErrors,
  formMessage,
  isSubmitting,
  onOpenChange,
  onChange,
  onSubmit,
}: SubscriptionFormModalProps) {
  const contractDateInputRef = useRef<HTMLInputElement>(null);
  const nextRenewalPreview = useMemo(
    () => getNextRenewalPreview(values),
    [values]
  );

  const submitLabel = isSubmitting
    ? mode === "edit"
      ? "更新中..."
      : "登録中..."
    : mode === "edit"
      ? "更新する"
      : "登録する";

  const contractDateLabel = values.contractDate
    ? formatContractDateYmd(values.contractDate)
    : "日付を選択";

  const onContractDateClick = () => {
    const input = contractDateInputRef.current;
    if (!input) {
      return;
    }

    openNativeDatePicker(input);
    input.focus({ preventScroll: true });
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto border-white/20 bg-[#3D3D3D] text-white max-sm:px-4 max-sm:py-5 sm:max-w-md sm:py-7"
        closeButtonClassName="max-sm:top-5 max-sm:right-4 sm:top-7 sm:right-6"
      >
        <DialogHeader className="py-3 text-left sm:py-2">
          <DialogTitle className="pr-12 text-white max-sm:pr-14">
            {mode === "edit"
              ? "サブスクリプション修正"
              : "サブスクリプション登録"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <Label htmlFor="subscription-name" className="mb-2 text-white">
              サブスクリプション名
            </Label>
            <Input
              id="subscription-name"
              value={values.name}
              maxLength={SUBSCRIPTION_NAME_MAX_LENGTH}
              onChange={(event) => onChange({ name: event.target.value })}
              className={FIELD_INPUT_CLASS}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <Label htmlFor="subscription-plan-name" className="mb-2 text-white">
              プラン名
            </Label>
            <Input
              id="subscription-plan-name"
              value={values.planName}
              maxLength={SUBSCRIPTION_PLAN_NAME_MAX_LENGTH}
              onChange={(event) => onChange({ planName: event.target.value })}
              className={FIELD_INPUT_CLASS}
              aria-invalid={Boolean(fieldErrors.planName)}
            />
            <FieldError message={fieldErrors.planName} />
          </div>

          <div>
            <Label htmlFor="subscription-payment-plan" className="mb-2 text-white">
              支払いプラン
            </Label>
            <Select
              value={values.paymentPlan || undefined}
              onValueChange={(value) =>
                onChange({
                  paymentPlan: value as SubscriptionRegisterFormValues["paymentPlan"],
                })
              }
            >
              <SelectTrigger
                id="subscription-payment-plan"
                className={cn("w-full min-w-0 bg-white text-slate-900", {
                  "border-destructive": Boolean(fieldErrors.paymentPlan),
                })}
              >
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">
                  {PAYMENT_PLAN_LABELS.MONTHLY}
                </SelectItem>
                <SelectItem value="YEARLY">
                  {PAYMENT_PLAN_LABELS.YEARLY}
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError message={fieldErrors.paymentPlan} />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 max-sm:gap-2">
            <div className="min-w-0">
              <Label htmlFor="subscription-monthly" className="mb-2 text-white">
                月額
              </Label>
              <Input
                id="subscription-monthly"
                value={values.monthlyAmount}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(event) =>
                  onChange({
                    monthlyAmount: sanitizeAmountInput(event.target.value),
                  })
                }
                onBlur={() => onChange(syncAnnualFromMonthly(values.monthlyAmount))}
                className={FIELD_INPUT_CLASS}
                aria-invalid={Boolean(fieldErrors.monthlyAmount)}
              />
              <FieldError message={fieldErrors.monthlyAmount} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="subscription-annual" className="mb-2 text-white">
                年額
              </Label>
              <Input
                id="subscription-annual"
                value={values.annualAmount}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(event) =>
                  onChange({
                    annualAmount: sanitizeAmountInput(event.target.value),
                  })
                }
                onBlur={() => onChange(syncMonthlyFromAnnual(values.annualAmount))}
                className={FIELD_INPUT_CLASS}
                aria-invalid={Boolean(fieldErrors.annualAmount)}
              />
              <FieldError message={fieldErrors.annualAmount} />
            </div>
          </div>

          <div className="min-w-0">
            <Label htmlFor="subscription-contract-date" className="mb-2 text-white">
              契約日
            </Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={onContractDateClick}
                aria-invalid={Boolean(fieldErrors.contractDate)}
                className={cn(
                  "h-9 w-full max-md:w-48 justify-start gap-2 border-input bg-white px-3 font-normal text-slate-900 hover:bg-white",
                  !values.contractDate && "text-slate-400"
                )}
              >
                <CalendarIcon className="size-4 shrink-0 text-slate-500" />
                <span className="truncate">{contractDateLabel}</span>
              </Button>
              <Input
                ref={contractDateInputRef}
                id="subscription-contract-date"
                type="date"
                value={values.contractDate}
                onChange={(event) =>
                  onChange({ contractDate: event.target.value })
                }
                className={cn(
                  "pointer-events-none absolute h-0 w-0 opacity-0",
                  "subscription-date-input"
                )}
                tabIndex={-1}
                aria-hidden
              />
            </div>
            <FieldError message={fieldErrors.contractDate} />
          </div>

          <div>
            <Label className="mb-2 text-white">次回更新日</Label>
            <p className="flex min-h-9 items-center rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white/90">
              {nextRenewalPreview}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="subscription-notify"
              checked={values.notifyEnabled}
              onCheckedChange={(checked) =>
                onChange({ notifyEnabled: checked === true })
              }
              aria-label="お知らせ"
            />
            <Label htmlFor="subscription-notify" className="text-white">
              お知らせ
            </Label>
            <FieldError message={fieldErrors.notifyEnabled} />
          </div>

          <FieldError message={fieldErrors.form ?? formMessage} />

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="h-10 w-full bg-[#8A2082] text-white hover:bg-[#74206E]"
          >
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
