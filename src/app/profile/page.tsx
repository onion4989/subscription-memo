import Link from "next/link";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.login);
  }

  const displayName = session.user.name?.trim() || null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">ユーザー情報</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          表示名（ニックネーム）は登録後にここで設定する想定です。編集フォームは今後追加します。
        </p>
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">メール</dt>
          <dd>{session.user.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">表示名</dt>
          <dd>{displayName ?? "未設定"}</dd>
        </div>
      </dl>
      <Link
        href={ROUTES.success}
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
