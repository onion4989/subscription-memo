export function formatYenAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return "—";
  }

  return `${amount.toLocaleString("ja-JP")}円`;
}

export function formatContractDateYmd(ymd: string): string {
  const [year, month, day] = ymd.split("-");
  return `${year}/${month}/${day}`;
}
