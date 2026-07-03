import type { PaymentPlan } from "@prisma/client";
import { PAYMENT_PLAN_LABELS } from "@/lib/subscription/constants";
import { formatContractDateYmd, formatYenAmount } from "@/lib/subscription/format";

export type RenewalDigestLineItem = {
  subscriptionName: string;
  planName: string;
  paymentPlan: PaymentPlan;
  renewalDateYmd: string;
  monthlyAmount: number | null;
  annualAmount: number | null;
};

export const RENEWAL_DIGEST_EMAIL_SUBJECT =
  "【サブスクMEMO】サブスクリプション更新日のお知らせ";

function formatDigestAmount(item: RenewalDigestLineItem): string {
  if (item.paymentPlan === "MONTHLY") {
    return `月額 ${formatYenAmount(item.monthlyAmount)}`;
  }

  return `年額 ${formatYenAmount(item.annualAmount)}`;
}

export function buildRenewalDigestEmailText(params: {
  displayName: string;
  items: RenewalDigestLineItem[];
}): string {
  const lines = [
    `${params.displayName} 様`,
    "",
    "登録されているサブスクリプションの更新日が近づいています。",
    "",
  ];

  params.items.forEach((item, index) => {
    lines.push(
      `■ ${index + 1}件目`,
      `サブスクリプション名: ${item.subscriptionName}`,
      `プラン名: ${item.planName}`,
      `支払いプラン: ${PAYMENT_PLAN_LABELS[item.paymentPlan]}`,
      `更新日: ${formatContractDateYmd(item.renewalDateYmd)}`,
      `金額: ${formatDigestAmount(item)}`,
      ""
    );
  });

  lines.push(
    "※このメールはサブスクMEMOのお知らせ設定に基づいて送信されています。",
    "配信の変更は「各種設定」から行えます。"
  );

  return lines.join("\n");
}
