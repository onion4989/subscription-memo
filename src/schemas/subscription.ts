import * as z from "zod";
import {
  SUBSCRIPTION_NAME_MAX_LENGTH,
  SUBSCRIPTION_PLAN_NAME_MAX_LENGTH,
} from "@/lib/subscription/constants";
import { isValidYmd } from "@/lib/subscription/renewal-date";

const optionalAmountSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine((value) => value === "" || /^\d+$/.test(value), {
    message: "金額は数字のみ入力してください。",
  })
  .transform((value) => (value === "" ? null : Number.parseInt(value, 10)));

export const subscriptionRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "サブスクリプション名は必須です。")
    .max(
      SUBSCRIPTION_NAME_MAX_LENGTH,
      `サブスクリプション名は${SUBSCRIPTION_NAME_MAX_LENGTH}文字以内で入力してください。`
    ),
  planName: z
    .string()
    .trim()
    .min(1, "プラン名は必須です。")
    .max(
      SUBSCRIPTION_PLAN_NAME_MAX_LENGTH,
      `プラン名は${SUBSCRIPTION_PLAN_NAME_MAX_LENGTH}文字以内で入力してください。`
    ),
  paymentPlan: z
    .string()
    .refine(
      (value): value is "MONTHLY" | "YEARLY" =>
        value === "MONTHLY" || value === "YEARLY",
      { message: "支払いプランを選択してください。" }
    ),
  monthlyAmount: optionalAmountSchema,
  annualAmount: optionalAmountSchema,
  contractDate: z
    .string()
    .trim()
    .min(1, "契約日は必須です。")
    .refine(isValidYmd, { message: "契約日の形式が正しくありません。" }),
  notifyEnabled: z.boolean(),
});

export type SubscriptionRegisterInput = z.infer<
  typeof subscriptionRegisterSchema
>;

export type SubscriptionRegisterFieldErrors = Partial<
  Record<
    | "name"
    | "planName"
    | "paymentPlan"
    | "monthlyAmount"
    | "annualAmount"
    | "contractDate"
    | "notifyEnabled"
    | "form",
    string
  >
>;

export function subscriptionRegisterFieldErrorsFromZod(
  error: z.ZodError<SubscriptionRegisterInput>
): SubscriptionRegisterFieldErrors {
  const { fieldErrors } = error.flatten();
  return {
    name: fieldErrors.name?.[0],
    planName: fieldErrors.planName?.[0],
    paymentPlan: fieldErrors.paymentPlan?.[0],
    monthlyAmount: fieldErrors.monthlyAmount?.[0],
    annualAmount: fieldErrors.annualAmount?.[0],
    contractDate: fieldErrors.contractDate?.[0],
    notifyEnabled: fieldErrors.notifyEnabled?.[0],
  };
}

export type SubscriptionRegisterFormValues = {
  name: string;
  planName: string;
  paymentPlan: "" | "MONTHLY" | "YEARLY";
  monthlyAmount: string;
  annualAmount: string;
  contractDate: string;
  notifyEnabled: boolean;
};

export const EMPTY_SUBSCRIPTION_FORM_VALUES: SubscriptionRegisterFormValues = {
  name: "",
  planName: "",
  paymentPlan: "",
  monthlyAmount: "",
  annualAmount: "",
  contractDate: "",
  notifyEnabled: false,
};

export function subscriptionRegisterInputFromFormValues(
  values: SubscriptionRegisterFormValues
) {
  return {
    name: values.name,
    planName: values.planName,
    paymentPlan:
      values.paymentPlan === "" ? ("" as const) : values.paymentPlan,
    monthlyAmount: values.monthlyAmount,
    annualAmount: values.annualAmount,
    contractDate: values.contractDate,
    notifyEnabled: values.notifyEnabled,
  };
}

export function subscriptionFormValuesFromSaved(input: {
  name: string;
  planName: string;
  paymentPlan: "MONTHLY" | "YEARLY";
  monthlyAmount: number | null;
  annualAmount: number | null;
  contractDate: string;
  notifyEnabled: boolean;
}): SubscriptionRegisterFormValues {
  return {
    name: input.name,
    planName: input.planName,
    paymentPlan: input.paymentPlan,
    monthlyAmount:
      input.monthlyAmount === null ? "" : String(input.monthlyAmount),
    annualAmount:
      input.annualAmount === null ? "" : String(input.annualAmount),
    contractDate: input.contractDate,
    notifyEnabled: input.notifyEnabled,
  };
}
