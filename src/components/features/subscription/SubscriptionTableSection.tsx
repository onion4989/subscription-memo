/** 説明文など文案を左寄せするページ外枠 */
export const SUBSCRIPTION_PAGE_CONTENT_CLASS =
  "flex w-full min-w-0 flex-col items-start gap-4";

/** テーブル・カードをまとめるブロック（シェル内コンテンツ全幅） */
export const SUBSCRIPTION_TABLE_BLOCK_CLASS =
  "flex w-full flex-col items-start";

/** お知らせ・テーブル共通のセクション外枠 */
export const SUBSCRIPTION_SECTION_FRAME_CLASS =
  "w-full rounded-[10px] border-2 border-white bg-black p-5";

/**
 * テーブル用外枠。
 * 「更新間近」吹き出し分の上余白はスクロール領域（SUBSCRIPTION_TABLE_SCROLL_AREA_CLASS）側に確保する。
 */
export const SUBSCRIPTION_TABLE_SECTION_FRAME_CLASS =
  "w-full rounded-[10px] border-2 border-white bg-black px-5 pb-9";

/**
 * テーブル横スクロール領域。
 * overflow-x でも吹き出しが切れないよう、ヘッダー上余白（pt-16）をここに置く。
 */
export const SUBSCRIPTION_TABLE_SCROLL_AREA_CLASS =
  "max-w-full pt-16";

/** 「更新間近」吹き出しの表示判定用。枠外に出た列のタグを隠す */
export const SUBSCRIPTION_TABLE_FRAME_DATA_ATTR =
  "data-subscription-table-frame" as const;

/** 削除画面など、テーブル幅に合わせてブロックを縮める場合に使用 */
export const SUBSCRIPTION_TABLE_WIDTH_CONTAINER_CLASS =
  "flex w-max max-w-full flex-col lg:w-full lg:min-w-0";

/** 行をコンテンツ領域内で中央寄せする（追加ボタン等） */
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
