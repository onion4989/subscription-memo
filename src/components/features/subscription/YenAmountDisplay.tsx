const YEN_SUFFIX_CLASS = "ml-[2px] text-[10px] font-normal leading-none";

const SUMMARY_AMOUNT_CLASS =
  "relative inline-block text-[20px] font-bold leading-none after:absolute after:bottom-[2px] after:left-full after:ml-[2px] after:text-[10px] after:font-normal after:leading-none after:content-['円']";

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
      <span
        className={SUMMARY_AMOUNT_CLASS}
        aria-label={`${formattedAmount}円`}
      >
        {formattedAmount}
      </span>
    );
  }

  // テーブルセルの truncate（text-overflow: ellipsis）が効くよう、flex は使わない
  return (
    <>
      {formattedAmount}
      <span className={YEN_SUFFIX_CLASS}>円</span>
    </>
  );
}
