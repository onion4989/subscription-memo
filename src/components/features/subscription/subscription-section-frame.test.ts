import { describe, expect, it } from "vitest";
import {
  SUBSCRIPTION_SECTION_FRAME_CLASS,
  SUBSCRIPTION_TABLE_FRAME_DATA_ATTR,
  SUBSCRIPTION_TABLE_SCROLL_AREA_CLASS,
  SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS,
} from "@/components/features/subscription/SubscriptionTableSection";

describe("subscription section frame classes", () => {
  it("お知らせ枠は黒背景・白2px・四辺20px余白", () => {
    expect(SUBSCRIPTION_SECTION_FRAME_CLASS).toContain("bg-black");
    expect(SUBSCRIPTION_SECTION_FRAME_CLASS).toContain("border-2");
    expect(SUBSCRIPTION_SECTION_FRAME_CLASS).toContain("border-white");
    expect(SUBSCRIPTION_SECTION_FRAME_CLASS).toContain("p-5");
    expect(SUBSCRIPTION_SECTION_FRAME_CLASS).toContain("w-full");
    expect(SUBSCRIPTION_SECTION_FRAME_CLASS).toContain("rounded-[10px]");
  });

  it("テーブル枠は黒背景・白2px・上下余白はスクロール領域側", () => {
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).toContain("bg-black");
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).toContain("border-2");
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).toContain("border-white");
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).toContain("px-5");
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).toContain("pb-9");
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).not.toContain("pt-16");
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).toContain("w-full");
    expect(SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS).not.toContain(" p-5");
  });

  it("テーブルスクロール領域は吹き出し用の上余白を持つ", () => {
    expect(SUBSCRIPTION_TABLE_SCROLL_AREA_CLASS).toContain("pt-16");
    expect(SUBSCRIPTION_TABLE_SCROLL_AREA_CLASS).toContain("max-w-full");
  });

  it("枠外判定用の data 属性名を公開する", () => {
    expect(SUBSCRIPTION_TABLE_FRAME_DATA_ATTR).toBe(
      "data-subscription-table-frame"
    );
  });
});
