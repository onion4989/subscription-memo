/** 親の pr-[60px] 分。横線の起点（ボタン中央）計算から差し引く */
const TABLE_GUIDE_EXTRA_PX = 60;

/**
 * 登録画面の「＋追加」から次列挿入位置へのガイド矢印。
 * 親は `relative w-max pr-[60px]` であること（right-0 = テーブル右端 + 60px）。
 * 差し戻し時はこの呼び出しを外す。
 */
export function AddColumnGuideArrow() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[0.7rem] hidden h-5 md:block"
      aria-hidden="true"
    >
      {/* ボタン右から（テーブル最大長 + 60px）まで水平 */}
      <div
        className="absolute right-0 bottom-0 h-px bg-white"
        style={{
          left: `calc(50% - ${TABLE_GUIDE_EXTRA_PX / 2}px + 2.75rem)`,
        }}
      />
      {/* 縦線＋上向き矢印（テーブル右端 + 60px） */}
      <div className="absolute top-0 right-0 bottom-0 flex w-0 flex-col items-center">
        <div className="size-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-white" />
        <div className="w-0.5 flex-1 bg-white" />
      </div>
    </div>
  );
}
