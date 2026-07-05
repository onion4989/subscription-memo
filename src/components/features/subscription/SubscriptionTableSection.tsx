/** 説明文など文案を左寄せするページ外枠 */
export const SUBSCRIPTION_PAGE_CONTENT_CLASS =
  "flex w-full min-w-0 flex-col items-start gap-4";

/** テーブル・カードをまとめるブロック（lg 以上でテーブル全幅ストレッチ） */
export const SUBSCRIPTION_TABLE_BLOCK_CLASS =
  "flex w-full flex-col items-start";

/** テーブルブロック（lg 未満: テーブル幅 w-max / lg 以上: コンテンツ全幅） */
export const SUBSCRIPTION_TABLE_WIDTH_CONTAINER_CLASS =
  "flex w-max max-w-full flex-col lg:w-full lg:min-w-0";

/** テーブル幅に対して中央寄せする行（サマリーカード・追加ボタン等） */
export const SUBSCRIPTION_TABLE_CENTERED_ROW_CLASS =
  "flex w-full justify-center";

type SubscriptionTableSectionProps = {
  children: React.ReactNode;
  description?: React.ReactNode;
  tableBlockClassName?: string;
};

export function SubscriptionTableSection({
  children,
  description,
  tableBlockClassName,
}: SubscriptionTableSectionProps) {
  return (
    <div className={SUBSCRIPTION_PAGE_CONTENT_CLASS}>
      {description}
      <div
        className={
          tableBlockClassName ?? `${SUBSCRIPTION_TABLE_BLOCK_CLASS} gap-4`
        }
      >
        {children}
      </div>
    </div>
  );
}
