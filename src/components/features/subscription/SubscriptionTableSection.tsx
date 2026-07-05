import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

/** 説明文など文案を左寄せするページ外枠 */
export const SUBSCRIPTION_PAGE_CONTENT_CLASS =
  "flex w-full min-w-0 flex-col items-start gap-4";

/** テーブル・カード・操作ボタンをまとめて中央寄せするブロック */
export const SUBSCRIPTION_TABLE_BLOCK_CLASS =
  "mx-auto flex w-max flex-col items-center";

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
    <div className={APP_SCROLLBAR_X_CLASS}>
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
    </div>
  );
}
