import { auth } from "@/lib/auth";

const GUEST_DISPLAY_NAME = "ゲスト";

export default async function AccountPage() {
  const session = await auth();
  const displayName = session?.user?.name?.trim() || GUEST_DISPLAY_NAME;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 text-white">
      <h1 className="sr-only">アカウント</h1>
      <p className="text-sm text-white/80">
        ニックネーム・メール・電話・パスワード・アバターは今後ここで編集できる予定です。
      </p>
      <dl className="max-w-md space-y-3 text-sm">
        <div>
          <dt className="font-medium text-white/70">メール</dt>
          <dd>{session?.user?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-white/70">ニックネーム</dt>
          <dd>{displayName}</dd>
        </div>
      </dl>
    </div>
  );
}
