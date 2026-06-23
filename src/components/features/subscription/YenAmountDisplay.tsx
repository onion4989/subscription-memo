const YEN_SUFFIX_CLASS = "ml-[2px] text-[10px] font-normal leading-none";

type YenAmountDisplayProps = {
  amount: number | null | undefined;
  variant?: "summary" | "table";
};

export function YenAmountDisplay({
  amount,
  variant = "table",
}: YenAmountDisplayProps) {
  if (amount === null || amount === undefined) {
    return <>—</>;
  }

  const formattedAmount = amount.toLocaleString("ja-JP");

  if (variant === "summary") {
    return (
      <span className="inline-flex items-baseline">
        <span className="text-[20px] font-bold leading-none">{formattedAmount}</span>
        <span className={YEN_SUFFIX_CLASS}>円</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline">
      <span>{formattedAmount}</span>
      <span className={YEN_SUFFIX_CLASS}>円</span>
    </span>
  );
}
