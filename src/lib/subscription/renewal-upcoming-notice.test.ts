import { describe, expect, it } from "vitest";
import {
  buildUpcomingRenewalNotices,
  formatSubscriptionDisplayName,
  getUpcomingRenewalUrgencyTier,
  truncateNoticeDisplayName,
} from "@/lib/subscription/renewal-upcoming-notice";

describe("formatSubscriptionDisplayName", () => {
  it("joins name and plan with a space", () => {
    expect(formatSubscriptionDisplayName("Amazon Prime", "Pro")).toBe(
      "Amazon Prime Pro"
    );
    expect(formatSubscriptionDisplayName("Vercel", "Pro")).toBe("Vercel Pro");
  });
});

describe("truncateNoticeDisplayName", () => {
  it("returns the original name when within max length", () => {
    expect(truncateNoticeDisplayName("Netflix")).toBe("Netflix");
    expect(truncateNoticeDisplayName("Vercel Pro")).toBe("Vercel Pro");
  });

  it("truncates to max length and appends …", () => {
    expect(truncateNoticeDisplayName("Amazon Prime")).toBe("Amazon Pri…");
    expect(truncateNoticeDisplayName("Amazon Prime Pro")).toBe("Amazon Pri…");
  });
});

describe("getUpcomingRenewalUrgencyTier", () => {
  it("maps 0–3 to tier 3, 4–5 to tier 5, otherwise null", () => {
    expect(getUpcomingRenewalUrgencyTier(-1)).toBeNull();
    expect(getUpcomingRenewalUrgencyTier(0)).toBe(3);
    expect(getUpcomingRenewalUrgencyTier(3)).toBe(3);
    expect(getUpcomingRenewalUrgencyTier(4)).toBe(5);
    expect(getUpcomingRenewalUrgencyTier(5)).toBe(5);
    expect(getUpcomingRenewalUrgencyTier(6)).toBeNull();
  });
});

describe("buildUpcomingRenewalNotices", () => {
  const asOfYmd = "2026-07-21";

  it("includes 0–5 days until renewal with urgency tiers, sorted by renewal date", () => {
    const items = buildUpcomingRenewalNotices(
      [
        {
          id: "five",
          name: "Amazon Prime",
          planName: "Pro",
          nextRenewalDate: "2026-07-26",
        },
        {
          id: "four",
          name: "Spotify",
          planName: "Premium",
          nextRenewalDate: "2026-07-25",
        },
        {
          id: "three",
          name: "Vercel",
          planName: "Pro",
          nextRenewalDate: "2026-07-24",
        },
        {
          id: "today",
          name: "Netflix",
          planName: "Standard",
          nextRenewalDate: "2026-07-21",
        },
        {
          id: "past",
          name: "Old",
          planName: "Plan",
          nextRenewalDate: "2026-07-20",
        },
        {
          id: "far",
          name: "Far",
          planName: "Away",
          nextRenewalDate: "2026-07-28",
        },
      ],
      asOfYmd
    );

    expect(items).toEqual([
      {
        id: "today",
        displayName: "Netflix Standard",
        daysUntil: 0,
        urgencyTier: 3,
        nextRenewalDate: "2026-07-21",
      },
      {
        id: "three",
        displayName: "Vercel Pro",
        daysUntil: 3,
        urgencyTier: 3,
        nextRenewalDate: "2026-07-24",
      },
      {
        id: "four",
        displayName: "Spotify Premium",
        daysUntil: 4,
        urgencyTier: 5,
        nextRenewalDate: "2026-07-25",
      },
      {
        id: "five",
        displayName: "Amazon Prime Pro",
        daysUntil: 5,
        urgencyTier: 5,
        nextRenewalDate: "2026-07-26",
      },
    ]);
  });

  it("returns empty when nothing matches", () => {
    expect(
      buildUpcomingRenewalNotices(
        [
          {
            id: "one",
            name: "Netflix",
            planName: "Standard",
            nextRenewalDate: "2026-08-01",
          },
        ],
        asOfYmd
      )
    ).toEqual([]);
  });
});
