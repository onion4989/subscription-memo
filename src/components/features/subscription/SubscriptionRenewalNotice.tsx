import { SUBSCRIPTION_SECTION_FRAME_CLASS } from "@/components/features/subscription/SubscriptionTableSection";
import {
  buildUpcomingRenewalNotices,
  truncateNoticeDisplayName,
  type UpcomingRenewalNoticeItem,
  type UpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";
import { cn } from "@/lib/utils";

const EMPTY_NOTICE_MESSAGE =
  "現在お知らせはありません。\n登録したサブスクリプションの次回更新日が5日以内になったら、こちらのお知らせが更新されます。";

/** 差し替えやすいよう色だけ定数化（！は簡易実装）。テーマ CSS 変数を参照 */
const NOTICE_ICON_COLORS: Record<UpcomingRenewalUrgencyTier, string> = {
  3: "var(--app-notice-icon-urgent)",
  5: "var(--app-notice-icon-soon)",
};

/** モバイル 14px / デスクトップ 16px（カード本文と揃える）。枠内は常に白 */
const NOTICE_BODY_TEXT_CLASS =
  "text-[14px] leading-normal text-white md:text-base";

/** モバイル 16px / デスクトップ 20px（数字＋「日後」を同サイズ・折り返し禁止） */
const NOTICE_HIGHLIGHT_TEXT_CLASS =
  "whitespace-nowrap text-[16px] font-bold underline underline-offset-[5px] md:text-[20px]";

type SubscriptionRenewalNoticeProps = {
  subscriptions: SavedSubscriptionRow[];
};

function NoticeExclamationIcon({
  urgencyTier,
}: {
  urgencyTier: UpcomingRenewalUrgencyTier;
}) {
  return (
    <span
      className="inline-flex size-[15px] shrink-0 items-center justify-center text-[14px] leading-none text-black"
      style={{ backgroundColor: NOTICE_ICON_COLORS[urgencyTier] }}
      aria-hidden="true"
      data-notice-icon-days={urgencyTier}
    >
      ！
    </span>
  );
}

function NoticeRemainingHighlight({ daysUntil }: { daysUntil: number }) {
  if (daysUntil === 0) {
    return <span className={NOTICE_HIGHLIGHT_TEXT_CLASS}>本日中</span>;
  }

  return (
    <>
      あと
      <span className={NOTICE_HIGHLIGHT_TEXT_CLASS}>{daysUntil}日後</span>
    </>
  );
}

function formatNoticeAriaLabel(item: UpcomingRenewalNoticeItem): string {
  const remaining =
    item.daysUntil === 0 ? "本日中" : `あと${item.daysUntil}日後`;
  return `${item.displayName} は、${remaining}です。`;
}

function NoticeLine({ item }: { item: UpcomingRenewalNoticeItem }) {
  return (
    <div className="flex items-center gap-2">
      <NoticeExclamationIcon urgencyTier={item.urgencyTier} />
      <p
        className={cn(NOTICE_BODY_TEXT_CLASS, "min-w-0")}
        aria-label={formatNoticeAriaLabel(item)}
      >
        <span aria-hidden="true">
          <span className="md:hidden" title={item.displayName}>
            {truncateNoticeDisplayName(item.displayName)}は、
          </span>
          <span className="hidden md:inline">{item.displayName} は、</span>
          <NoticeRemainingHighlight daysUntil={item.daysUntil} />
          です。
        </span>
      </p>
    </div>
  );
}

export function SubscriptionRenewalNotice({
  subscriptions,
}: SubscriptionRenewalNoticeProps) {
  const items = buildUpcomingRenewalNotices(subscriptions);

  return (
    <section
      className="w-full pb-4 md:pb-0"
      aria-labelledby="subscription-renewal-notice-heading"
    >
      <h2
        id="subscription-renewal-notice-heading"
        className="mb-4 text-[14px] font-bold text-[color:var(--app-fg)] md:mb-3 md:text-base"
      >
        お知らせ
      </h2>
      <div
        className={cn(SUBSCRIPTION_SECTION_FRAME_CLASS, "py-6 md:py-5")}
      >
        {items.length === 0 ? (
          <p className={cn("whitespace-pre-line", NOTICE_BODY_TEXT_CLASS)}>
            {EMPTY_NOTICE_MESSAGE}
          </p>
        ) : (
          <ul className="flex flex-col gap-3 md:gap-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <NoticeLine item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
