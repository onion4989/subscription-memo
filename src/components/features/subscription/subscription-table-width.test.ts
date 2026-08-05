import { describe, expect, it } from "vitest";
import {
  getSubscriptionTableWidthRem,
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM,
  SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM,
  SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM,
} from "@/lib/subscription/subscription-table-layout";

describe("getSubscriptionTableWidthRem", () => {
  it("ラベル列とデータ列は同じ幅を使う", () => {
    expect(SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM).toBe(
      SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM
    );
    expect(SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM).toBe(
      SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM
    );
  });

  it("ラベル列 + データ列数 × 列幅で算出する", () => {
    expect(getSubscriptionTableWidthRem(0)).toBe(
      SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM
    );
    expect(getSubscriptionTableWidthRem(6)).toBe(
      SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM +
        6 * SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM
    );
  });
});
