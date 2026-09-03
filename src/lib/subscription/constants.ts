export const SUBSCRIPTION_NAME_MAX_LENGTH = 30;
export const SUBSCRIPTION_PLAN_NAME_MAX_LENGTH = 30;
export const SUBSCRIPTION_MAX_ROWS = 10;
export const SUB_REG_RATE_LIMIT_PER_MIN = 10;
export const SUB_REG_RATE_LIMIT_WINDOW_MS = 60_000;

export const PAYMENT_PLAN_LABELS = {
  MONTHLY: "月払い",
  YEARLY: "年額払い",
} as const;

export type PaymentPlanValue = keyof typeof PAYMENT_PLAN_LABELS;
