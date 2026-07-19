import { describe, expect, it } from "vitest";
import {
  formatContractDateYmd,
  formatYenAmount,
} from "@/lib/subscription/format";
import { computeSubscriptionSummary } from "@/lib/subscription/summary";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

function row(
  partial: Partial<SavedSubscriptionRow> & Pick<SavedSubscriptionRow, "id">
): SavedSubscriptionRow {
  return {
    name: "Netflix",
    planName: "Standard",
    paymentPlan: "MONTHLY",
    monthlyAmount: null,
    annualAmount: null,
    contractDate: "2025-01-01",
    nextRenewalDate: "2025-02-01",
    notifyEnabled: false,
    ...partial,
  };
}

describe("computeSubscriptionSummary (U1)", () => {
  it("counts rows and sums amounts treating null as 0", () => {
    const summary = computeSubscriptionSummary([
      row({ id: "1", monthlyAmount: 1000, annualAmount: 12000 }),
      row({ id: "2", monthlyAmount: null, annualAmount: 5000 }),
      row({ id: "3", monthlyAmount: 500, annualAmount: null }),
    ]);

    expect(summary).toEqual({
      contractCount: 3,
      monthlyTotal: 1500,
      annualTotal: 17000,
    });
  });

  it("returns zeros for an empty list", () => {
    expect(computeSubscriptionSummary([])).toEqual({
      contractCount: 0,
      monthlyTotal: 0,
      annualTotal: 0,
    });
  });
});

describe("formatYenAmount (U2)", () => {
  it("returns em dash for nullish values", () => {
    expect(formatYenAmount(null)).toBe("—");
    expect(formatYenAmount(undefined)).toBe("—");
  });

  it("formats with Japanese locale and 円 suffix", () => {
    expect(formatYenAmount(1200)).toBe("1,200円");
  });
});

describe("formatContractDateYmd (U3)", () => {
  it("converts YYYY-MM-DD to YYYY/MM/DD", () => {
    expect(formatContractDateYmd("2025-07-19")).toBe("2025/07/19");
  });
});
