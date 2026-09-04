/** ラベル列・データ列共通のセル幅（はみ出しは truncate） */
export const SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM = 8.75;

export const SUB_TABLE_LABEL_COL_WIDTH_REM =
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM;
export const SUB_TABLE_DATA_COL_MIN_REM =
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM;

/**
 * border-collapse による末尾の線のはみ出し（約数 px）を吸収する余白。
 * テーブル幅の calc にのみ使い、スクロール padding には足さない
 * （末尾の余分スクロールで sticky 見出しがズレるのを防ぐ）。
 */
export const SUB_TABLE_END_GUTTER_PX = 5;

/**
 * sticky 見出し列の左右縦線。
 * 左は inset（overflow で border が欠けない）、右は外側 shadow。
 * 左に border を重ねると二重線になるため、ラベルセルは border-left を付けない。
 */
export const SUB_TABLE_STICKY_EDGE_CLASS =
  "shadow-[inset_1px_0_0_0_#fff,1px_0_0_0_#fff]";

export function getSubscriptionTableWidthRem(dataColumnCount: number): number {
  return (
    SUB_TABLE_LABEL_COL_WIDTH_REM +
    dataColumnCount * SUB_TABLE_DATA_COL_MIN_REM
  );
}
