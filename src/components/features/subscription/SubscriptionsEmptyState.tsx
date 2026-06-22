import Image from "next/image";

export function SubscriptionsEmptyState() {
  return (
    <div className="space-y-4">
      <h2 className="text-[36px] font-bold text-white">
        データが登録されていません。
      </h2>
      <p className="text-base text-white/90">
        左側メニューのサブスクリプション登録・変更から新規データを登録してください。
      </p>
      <Image
        src="/assets/no-data-subsc-guide.png"
        alt="サブスクリプション未登録の案内"
        width={230}
        height={200}
        className="h-[200px] w-[230px] max-w-full object-contain"
      />
    </div>
  );
}
