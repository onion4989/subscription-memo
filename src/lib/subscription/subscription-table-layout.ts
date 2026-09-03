/** ラベル列・データ列共通のセル幅（はみ出しは truncate） */
export const SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM = 8.75;

export const SUB_TABLE_LABEL_COL_WIDTH_REM =
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM;
export const SUB_TABLE_DATA_COL_MIN_REM =
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM;

export function getSubscriptionTableWidthRem(dataColumnCount: number): number {
  return (
    SUB_TABLE_LABEL_COL_WIDTH_REM +
    dataColumnCount * SUB_TABLE_DATA_COL_MIN_REM
  );
}
