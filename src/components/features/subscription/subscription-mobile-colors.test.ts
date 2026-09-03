import { describe, expect, it } from "vitest";
import {
  getMobileUpcomingRenewalDotColor,
  getMobileUpcomingRenewalHighlightColors,
  MOBILE_SUBSCRIPTION_URGENT_COLOR,
  MOBILE_SUB_URGENT_FG_COLOR,
} from "@/components/features/subscription/subscription-mobile-colors";
import {
  UPCOMING_RENEWAL_CELL_COLORS,
  UPCOMING_RENEWAL_LABEL_TEXT_COLORS,
} from "@/lib/subscription/renewal-upcoming-notice";

describe("subscription-mobile-colors", () => {
  it("tier 3 はモバイル用アクセント色を返す", () => {
    expect(getMobileUpcomingRenewalHighlightColors(3)).toEqual({
      backgroundColor: MOBILE_SUBSCRIPTION_URGENT_COLOR,
      color: MOBILE_SUB_URGENT_FG_COLOR,
    });
    expect(getMobileUpcomingRenewalDotColor(3)).toBe(
      MOBILE_SUBSCRIPTION_URGENT_COLOR
    );
  });

  it("tier 5 はテーマの soon 色を返す", () => {
    expect(getMobileUpcomingRenewalHighlightColors(5)).toEqual({
      backgroundColor: UPCOMING_RENEWAL_CELL_COLORS[5],
      color: UPCOMING_RENEWAL_LABEL_TEXT_COLORS[5],
    });
    expect(getMobileUpcomingRenewalDotColor(5)).toBe(
      UPCOMING_RENEWAL_CELL_COLORS[5]
    );
  });
});
