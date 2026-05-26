/** 必須フィールドを示す装飾（ラベル内で使用） */
export function RequiredFieldMark() {
  return (
    <span
      className="-ml-1 align-super text-[10px] font-normal leading-none text-red-600 "
      aria-hidden="true"
    >
      *
    </span>
  );
}
