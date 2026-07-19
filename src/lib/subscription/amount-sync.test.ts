import { describe, expect, it } from "vitest";
import {
  sanitizeAmountInput,
  syncAnnualFromMonthly,
  syncMonthlyFromAnnual,
} from "@/lib/subscription/amount-sync";

describe("sanitizeAmountInput (A1)", () => {
  it("strips non-digit characters", () => {
    expect(sanitizeAmountInput("1,200円")).toBe("1200");
    expect(sanitizeAmountInput("abc")).toBe("");
  });
});

describe("syncAnnualFromMonthly (A2)", () => {
  it("clears both fields when monthly is empty", () => {
    expect(syncAnnualFromMonthly("")).toEqual({
      monthlyAmount: "",
      annualAmount: "",
    });
  });

  it("sets annual to monthly × 12", () => {
    expect(syncAnnualFromMonthly("1000")).toEqual({
      monthlyAmount: "1000",
      annualAmount: "12000",
    });
  });
});

describe("syncMonthlyFromAnnual (A3)", () => {
  it("clears both fields when annual is empty", () => {
    expect(syncMonthlyFromAnnual("")).toEqual({
      monthlyAmount: "",
      annualAmount: "",
    });
  });

  it("sets monthly to round(annual / 12)", () => {
    expect(syncMonthlyFromAnnual("10000")).toEqual({
      annualAmount: "10000",
      monthlyAmount: "833",
    });
  });
});
