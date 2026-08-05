export function SubscriptionsEmptyState() {
  return (
    <div className="space-y-4">
      <p className="pt-6 text-base text-[color:var(--app-fg)]/90">
        左側メニューのサブスクリプション登録・変更から新規データを登録してください。
      </p>
      <h2 className="text-[24px] font-bold text-[color:var(--app-fg)]">
        データが登録されていません。
      </h2>
    </div>
  );
}
