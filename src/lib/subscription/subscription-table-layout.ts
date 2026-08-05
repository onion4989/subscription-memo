/** ラベル列・データ列共通のセル幅（はみ出しは truncate） */
export const SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM = 8.75;

export const SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM =
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM;
export const SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM =
  SUBSCRIPTION_TABLE_COLUMN_WIDTH_REM;

export function getSubscriptionTableWidthRem(dataColumnCount: number): number {
  return (
    SUBSCRIPTION_TABLE_LABEL_COLUMN_WIDTH_REM +
    dataColumnCount * SUBSCRIPTION_TABLE_DATA_COLUMN_MIN_WIDTH_REM
  );
}
