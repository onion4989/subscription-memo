import { redirect } from "next/navigation";
import { SubscriptionDeleteForm } from "@/components/features/subscription/SubscriptionDeleteForm";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { getUserSubscriptions } from "@/lib/subscription/queries";
import { ROUTES } from "@/lib/routes";

export default async function SubscriptionsManagePage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(ROUTES.login);
  }

  const subscriptions = await getUserSubscriptions(userId);
  const hasSubscriptions = subscriptions.length > 0;

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex flex-col gap-4">
        <h1 className="sr-only">サブスクリプション削除</h1>
      </div>

      {hasSubscriptions ? (
        <SubscriptionDeleteForm initialSaved={subscriptions} />
      ) : (
        <div className="space-y-4">
          <h2 className="text-[36px] font-bold text-white">
            登録されたデータはありません。
          </h2>
          <p className="text-base text-white/90">
            登録済みのサブスクリプションを削除できます。
          </p>
        </div>
      )}
    </div>
  );
}
