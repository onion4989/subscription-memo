import { SUBSCRIPTION_SECTION_FRAME_CLASS } from "@/components/features/subscription/SubscriptionTableSection";
import {
  buildUpcomingRenewalNotices,
  type UpcomingRenewalNoticeItem,
  type UpcomingRenewalUrgencyTier,
} from "@/lib/subscription/renewal-upcoming-notice";
import type { SavedSubscriptionRow } from "@/lib/subscription/queries";

const EMPTY_NOTICE_MESSAGE =
  "現在お知らせはありません。\n登録したサブスクリプションの次回更新日が5日以内になったら、こちらのお知らせが更新されます。";

/** 差し替えやすいよう色だけ定数化（！は簡易実装） */
const NOTICE_ICON_COLORS: Record<UpcomingRenewalUrgencyTier, string> = {
  3: "#E62F5D",
  5: "#EDE466",
};

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
    return (
      <span className="font-bold underline underline-offset-[5px]">
        <span className="text-[20px] font-bold">本日中</span>
      </span>
    );
  }

  return (
    <>
      あと
      <span className="font-bold underline underline-offset-[5px]">
        <span className="text-[20px] font-bold">{daysUntil}</span>
        日後
      </span>
    </>
  );
}

function NoticeLine({ item }: { item: UpcomingRenewalNoticeItem }) {
  return (
    <div className="flex items-center gap-2">
      <NoticeExclamationIcon urgencyTier={item.urgencyTier} />
      <p className="text-base leading-normal text-white">
        {item.daysUntil === 0 ? (
          <>
            {item.displayName}の次回更新日は{" "}
            <NoticeRemainingHighlight daysUntil={0} /> です。
          </>
        ) : (
          <>
            {item.displayName}の次回更新日は、
            <NoticeRemainingHighlight daysUntil={item.daysUntil} />
            です。
          </>
        )}
      </p>
    </div>
  );
}

export function SubscriptionRenewalNotice({
  subscriptions,
}: SubscriptionRenewalNoticeProps) {
  const items = buildUpcomingRenewalNotices(subscriptions);

  return (
    <section className="w-full" aria-labelledby="subscription-renewal-notice-heading">
      <h2
        id="subscription-renewal-notice-heading"
        className="mb-3 text-base font-bold text-white"
      >
        お知らせ
      </h2>
      <div className={SUBSCRIPTION_SECTION_FRAME_CLASS}>
        {items.length === 0 ? (
          <p className="whitespace-pre-line text-base leading-normal text-white">
            {EMPTY_NOTICE_MESSAGE}
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
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
