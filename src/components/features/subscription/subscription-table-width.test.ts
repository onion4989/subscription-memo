import { describe, expect, it } from "vitest";
import {
  getSubscriptionTableWidthRem,
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM,
  SUB_TABLE_DATA_COL_MIN_REM,
  SUB_TABLE_LABEL_COL_WIDTH_REM,
  SUB_TABLE_STICKY_EDGE_CLASS,
} from "@/lib/subscription/subscription-table-layout";
import {
  getContentEndPaddingPx,
  getSnapEndPaddingPx,
  getSubTableColumnWidthPx,
  snapScrollLeftToColumn,
} from "@/lib/subscription/subscription-table-scroll-snap";

describe("getSubscriptionTableWidthRem", () => {
  it("ラベル列とデータ列は同じ幅を使う", () => {
    expect(SUB_TABLE_LABEL_COL_WIDTH_REM).toBe(
      SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM
    );
    expect(SUB_TABLE_DATA_COL_MIN_REM).toBe(
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

describe("subscription table sticky edge", () => {
  it("sticky 左右の縦線は box-shadow で描く", () => {
    expect(SUB_TABLE_STICKY_EDGE_CLASS).toContain("inset_1px_0_0_0_#fff");
    expect(SUB_TABLE_STICKY_EDGE_CLASS).toContain("1px_0_0_0_#fff");
  });
});

describe("snapScrollLeftToColumn", () => {
  it("列幅の倍数に丸める", () => {
    expect(snapScrollLeftToColumn(0, 100, 500)).toBe(0);
    expect(snapScrollLeftToColumn(49, 100, 500)).toBe(0);
    expect(snapScrollLeftToColumn(50, 100, 500)).toBe(100);
    expect(snapScrollLeftToColumn(140, 100, 500)).toBe(100);
    expect(snapScrollLeftToColumn(160, 100, 500)).toBe(200);
  });

  it("末尾付近は maxScrollLeft へ吸着し、途中に戻さない", () => {
    expect(snapScrollLeftToColumn(480, 100, 450)).toBe(450);
    expect(snapScrollLeftToColumn(430, 100, 450)).toBe(450);
    expect(snapScrollLeftToColumn(350, 140, 350)).toBe(350);
  });

  it("列幅が 0 以下ならそのまま返す", () => {
    expect(snapScrollLeftToColumn(123, 0, 500)).toBe(123);
  });
});

describe("getSnapEndPaddingPx", () => {
  it("余りがあるとき列幅に揃える padding を返す", () => {
    expect(getSnapEndPaddingPx(450, 100)).toBe(50);
    expect(getSnapEndPaddingPx(500, 100)).toBe(0);
    expect(getSnapEndPaddingPx(0, 100)).toBe(0);
  });
});

describe("getContentEndPaddingPx", () => {
  it("吸着用 padding のみ（gutter は含めない）", () => {
    expect(getContentEndPaddingPx(450, 100)).toBe(50);
    expect(getContentEndPaddingPx(500, 100)).toBe(0);
    expect(getContentEndPaddingPx(0, 100)).toBe(0);
  });
});

describe("getSubTableColumnWidthPx", () => {
  it("ルート font-size × 列幅 rem", () => {
    expect(getSubTableColumnWidthPx(16)).toBe(
      SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM * 16
    );
  });
});
