import { describe, expect, it } from "vitest";
import {
  RENEWAL_DIGEST_EMAIL_SUBJECT,
  buildRenewalDigestEmailText,
} from "@/lib/renewal-notification/digest-email";

describe("buildRenewalDigestEmailText (D1)", () => {
  it("includes subject constant, greeting, and line items", () => {
    expect(RENEWAL_DIGEST_EMAIL_SUBJECT).toContain("サブスクMEMO");

    const text = buildRenewalDigestEmailText({
      displayName: "太郎",
      items: [
        {
          subscriptionName: "Netflix",
          planName: "Standard",
          paymentPlan: "MONTHLY",
          renewalDateYmd: "2025-08-01",
          monthlyAmount: 1490,
          annualAmount: null,
        },
        {
          subscriptionName: "Adobe",
          planName: "Creative",
          paymentPlan: "YEARLY",
          renewalDateYmd: "2025-09-01",
          monthlyAmount: null,
          annualAmount: 72000,
        },
      ],
    });

    expect(text).toContain("太郎 様");
    expect(text).toContain("■ 1件目");
    expect(text).toContain("サブスクリプション名: Netflix");
    expect(text).toContain("支払いプラン: 月払い");
    expect(text).toContain("更新日: 2025/08/01");
    expect(text).toContain("金額: 月額 1,490円");
    expect(text).toContain("■ 2件目");
    expect(text).toContain("支払いプラン: 年額払い");
    expect(text).toContain("金額: 年額 72,000円");
  });
});
