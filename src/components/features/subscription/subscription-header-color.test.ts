import { describe, expect, it } from "vitest";
import { subscriptionHeaderColor } from "@/components/features/subscription/subscription-table-shared";

describe("subscriptionHeaderColor", () => {
  it("returns the start color when there is a single column", () => {
    expect(subscriptionHeaderColor(0, 1)).toBe("rgb(249, 203, 142)");
  });

  it("interpolates between start and end across multiple columns", () => {
    expect(subscriptionHeaderColor(0, 3)).toBe("rgb(249, 203, 142)");
    expect(subscriptionHeaderColor(2, 3)).toBe("rgb(162, 240, 235)");
    expect(subscriptionHeaderColor(1, 3)).toBe("rgb(206, 222, 189)");
  });
});
