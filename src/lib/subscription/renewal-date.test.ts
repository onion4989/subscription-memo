import { describe, expect, it } from "vitest";
import {
  addMonthsToYmd,
  addYearsToYmd,
  advanceRenewalDateToNextCycleYmd,
  computeNextRenewalDateYmd,
  computeNotifyDateYmd,
  daysBetweenYmd,
  isValidYmd,
  subtractDaysFromYmd,
  utcDateToYmd,
  ymdToUtcDate,
} from "@/lib/subscription/renewal-date";

describe("isValidYmd (R1)", () => {
  it("accepts a valid calendar date", () => {
    expect(isValidYmd("2025-03-15")).toBe(true);
  });

  it("rejects malformed strings", () => {
    expect(isValidYmd("2025/03/15")).toBe(false);
    expect(isValidYmd("25-03-15")).toBe(false);
    expect(isValidYmd("")).toBe(false);
  });

  it("rejects impossible calendar dates", () => {
    expect(isValidYmd("2025-02-30")).toBe(false);
    expect(isValidYmd("2025-13-01")).toBe(false);
    expect(isValidYmd("2025-00-10")).toBe(false);
  });
});

describe("addMonthsToYmd (R2)", () => {
  it("clamps end-of-month when target month is shorter", () => {
    expect(addMonthsToYmd("2025-01-31", 1)).toBe("2025-02-28");
  });

  it("advances a normal day by one month", () => {
    expect(addMonthsToYmd("2025-01-15", 1)).toBe("2025-02-15");
  });
});

describe("addYearsToYmd (R3)", () => {
  it("clamps Feb 29 when the destination year is not a leap year", () => {
    expect(addYearsToYmd("2024-02-29", 1)).toBe("2025-02-28");
  });

  it("keeps Feb 29 when the destination year is a leap year", () => {
    expect(addYearsToYmd("2024-02-29", 4)).toBe("2028-02-29");
  });
});

describe("computeNextRenewalDateYmd (R4–R7)", () => {
  it("returns contractDate + 1 period when contract is in the future (MONTHLY)", () => {
    expect(
      computeNextRenewalDateYmd("2025-06-01", "MONTHLY", "2025-05-01")
    ).toBe("2025-07-01");
  });

  it("returns contractDate + 1 period when contract is in the future (YEARLY)", () => {
    expect(
      computeNextRenewalDateYmd("2025-06-01", "YEARLY", "2025-05-01")
    ).toBe("2026-06-01");
  });

  it("finds the first renewal after asOf for a past contract (MONTHLY)", () => {
    expect(
      computeNextRenewalDateYmd("2025-01-10", "MONTHLY", "2025-03-15")
    ).toBe("2025-04-10");
  });

  it("advances to the next cycle when asOf equals a renewal day", () => {
    expect(
      computeNextRenewalDateYmd("2025-01-10", "MONTHLY", "2025-03-10")
    ).toBe("2025-04-10");
  });
});

describe("advanceRenewalDateToNextCycleYmd (R8)", () => {
  it("steps monthly and yearly cycles", () => {
    expect(advanceRenewalDateToNextCycleYmd("2025-03-10", "MONTHLY")).toBe(
      "2025-04-10"
    );
    expect(advanceRenewalDateToNextCycleYmd("2025-03-10", "YEARLY")).toBe(
      "2026-03-10"
    );
  });
});

describe("subtractDaysFromYmd / computeNotifyDateYmd (R9)", () => {
  it("subtracts across month boundaries", () => {
    expect(subtractDaysFromYmd("2025-03-01", 1)).toBe("2025-02-28");
    expect(computeNotifyDateYmd("2025-03-10", 3)).toBe("2025-03-07");
  });
});

describe("daysBetweenYmd", () => {
  it("returns signed calendar day difference", () => {
    expect(daysBetweenYmd("2026-07-21", "2026-07-26")).toBe(5);
    expect(daysBetweenYmd("2026-07-26", "2026-07-21")).toBe(-5);
  });
});

describe("ymdToUtcDate / utcDateToYmd (R10)", () => {
  it("round-trips YYYY-MM-DD via UTC noon Date", () => {
    const ymd = "2025-07-19";
    expect(utcDateToYmd(ymdToUtcDate(ymd))).toBe(ymd);
  });
});
