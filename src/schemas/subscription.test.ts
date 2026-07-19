import { describe, expect, it } from "vitest";
import {
  EMPTY_SUBSCRIPTION_FORM_VALUES,
  subscriptionFormValuesFromSaved,
  subscriptionRegisterFieldErrorsFromZod,
  subscriptionRegisterInputFromFormValues,
  subscriptionRegisterSchema,
} from "@/schemas/subscription";
import { SUBSCRIPTION_NAME_MAX_LENGTH } from "@/lib/subscription/constants";

const validInput = {
  name: "Netflix",
  planName: "Standard",
  paymentPlan: "MONTHLY" as const,
  monthlyAmount: "1000",
  annualAmount: "12000",
  contractDate: "2025-01-15",
  notifyEnabled: true,
};

describe("subscriptionRegisterSchema (S1–S5)", () => {
  it("accepts a valid payload", () => {
    const result = subscriptionRegisterSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthlyAmount).toBe(1000);
      expect(result.data.annualAmount).toBe(12000);
    }
  });

  it("requires name, planName, paymentPlan, and contractDate", () => {
    const result = subscriptionRegisterSchema.safeParse({
      ...validInput,
      name: "",
      planName: "",
      paymentPlan: "",
      contractDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects names over the max length", () => {
    const result = subscriptionRegisterSchema.safeParse({
      ...validInput,
      name: "あ".repeat(SUBSCRIPTION_NAME_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("transforms empty amounts to null and rejects non-digits", () => {
    const empty = subscriptionRegisterSchema.safeParse({
      ...validInput,
      monthlyAmount: "",
      annualAmount: "  ",
    });
    expect(empty.success).toBe(true);
    if (empty.success) {
      expect(empty.data.monthlyAmount).toBeNull();
      expect(empty.data.annualAmount).toBeNull();
    }

    const invalid = subscriptionRegisterSchema.safeParse({
      ...validInput,
      monthlyAmount: "1,000",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects invalid contract dates", () => {
    const result = subscriptionRegisterSchema.safeParse({
      ...validInput,
      contractDate: "2025-02-30",
    });
    expect(result.success).toBe(false);
  });
});

describe("subscription helpers (S6–S7)", () => {
  it("maps Zod field errors", () => {
    const parsed = subscriptionRegisterSchema.safeParse({
      ...validInput,
      name: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = subscriptionRegisterFieldErrorsFromZod(parsed.error);
      expect(errors.name).toBeTruthy();
    }
  });

  it("converts saved values and form values", () => {
    const fromSaved = subscriptionFormValuesFromSaved({
      name: "Spotify",
      planName: "Premium",
      paymentPlan: "YEARLY",
      monthlyAmount: null,
      annualAmount: 9800,
      contractDate: "2024-12-01",
      notifyEnabled: false,
    });
    expect(fromSaved.monthlyAmount).toBe("");
    expect(fromSaved.annualAmount).toBe("9800");

    const input = subscriptionRegisterInputFromFormValues({
      ...EMPTY_SUBSCRIPTION_FORM_VALUES,
      name: "A",
      planName: "B",
      paymentPlan: "MONTHLY",
      contractDate: "2025-01-01",
    });
    expect(input.paymentPlan).toBe("MONTHLY");
  });
});
