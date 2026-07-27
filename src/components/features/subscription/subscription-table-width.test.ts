import { describe, expect, it } from "vitest";
import {
  getSubscriptionTableWidthRem,
  SUBSCRIPTION_SUMMARY_MIN_DATA_COLUMNS,
  SUBSCRIPTION_SUMMARY_MIN_TABLE_WIDTH_REM,
  SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM,
  SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM,
} from "@/components/features/subscription/subscription-table-shared";

describe("getSubscriptionTableWidthRem", () => {
  it("ラベル列 + データ列数 × 列幅で算出する", () => {
    expect(getSubscriptionTableWidthRem(0)).toBe(
      SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM
    );
    expect(getSubscriptionTableWidthRem(6)).toBe(
      SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM +
        6 * SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM
    );
  });

  it("サマリー最小幅定数と MIN_DATA_COLUMNS が一致する", () => {
    expect(SUBSCRIPTION_SUMMARY_MIN_TABLE_WIDTH_REM).toBe(
      getSubscriptionTableWidthRem(SUBSCRIPTION_SUMMARY_MIN_DATA_COLUMNS)
    );
  });
});
