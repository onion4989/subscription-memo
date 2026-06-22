export type AmountSyncResult = {
  monthlyAmount: string;
  annualAmount: string;
};

export function sanitizeAmountInput(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeAmountDigits(digits: string): string {
  if (digits === "") {
    return "";
  }

  return String(Number(digits));
}

/** 月額 blur 時: 年額 = 月額 × 12。空欄なら両方クリア */
export function syncAnnualFromMonthly(monthlyDigits: string): AmountSyncResult {
  const sanitized = sanitizeAmountInput(monthlyDigits);

  if (sanitized === "") {
    return { monthlyAmount: "", annualAmount: "" };
  }

  const monthly = Number(normalizeAmountDigits(sanitized));

  return {
    monthlyAmount: String(monthly),
    annualAmount: String(monthly * 12),
  };
}

/** 年額 blur 時: 月額 = round(年額 ÷ 12)。空欄なら両方クリア */
export function syncMonthlyFromAnnual(annualDigits: string): AmountSyncResult {
  const sanitized = sanitizeAmountInput(annualDigits);

  if (sanitized === "") {
    return { monthlyAmount: "", annualAmount: "" };
  }

  const annual = Number(normalizeAmountDigits(sanitized));

  return {
    annualAmount: String(annual),
    monthlyAmount: String(Math.round(annual / 12)),
  };
}
