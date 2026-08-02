import { describe, expect, it } from "vitest";
import {
  DEMO_ACCOUNT_GUARD_MESSAGE,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
  isDemoUserEmail,
} from "@/lib/demo/constants";
import { buildDemoSubscriptionCreateMany } from "@/lib/demo/seed-subscriptions";
import { utcDateToYmd } from "@/lib/subscription/renewal-date";

describe("demo constants", () => {
  it("uses the public demo credentials", () => {
    expect(DEMO_USER_EMAIL).toBe("demo@example.com");
    expect(DEMO_USER_PASSWORD).toBe("demo1234");
    expect(DEMO_USER_PASSWORD.length).toBeGreaterThanOrEqual(8);
    expect(DEMO_ACCOUNT_GUARD_MESSAGE.length).toBeGreaterThan(0);
  });

  it("detects only the demo email (case-insensitive)", () => {
    expect(isDemoUserEmail("demo@example.com")).toBe(true);
    expect(isDemoUserEmail("Demo@Example.com")).toBe(true);
    expect(isDemoUserEmail(" user@example.com ")).toBe(false);
    expect(isDemoUserEmail(null)).toBe(false);
    expect(isDemoUserEmail(undefined)).toBe(false);
  });
});

describe("buildDemoSubscriptionCreateMany", () => {
  it("creates six notify-off subscriptions with computed renewal dates", () => {
    const rows = buildDemoSubscriptionCreateMany("user-demo", "2026-08-02");

    expect(rows).toHaveLength(6);
    expect(rows.every((row) => row.notifyEnabled === false)).toBe(true);
    expect(rows.every((row) => row.userId === "user-demo")).toBe(true);

    const names = rows.map((row) => `${row.name}/${row.planName}`);
    expect(new Set(names).size).toBe(6);

    for (const row of rows) {
      expect(row.contractDate).toBeInstanceOf(Date);
      expect(row.nextRenewalDate).toBeInstanceOf(Date);
      expect(utcDateToYmd(row.nextRenewalDate as Date) > "2026-08-02").toBe(
        true
      );
    }
  });
});
