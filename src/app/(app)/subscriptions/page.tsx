import { redirect } from "next/navigation";
import { SubscriptionListTable } from "@/components/features/subscription/SubscriptionListTable";
import { SubscriptionsEmptyState } from "@/components/features/subscription/SubscriptionsEmptyState";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { getUserSubscriptions } from "@/lib/subscription/queries";
import { ROUTES } from "@/lib/routes";

export default async function SubscriptionsPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(ROUTES.login);
  }

  const subscriptions = await getUserSubscriptions(userId);
  const hasSubscriptions = subscriptions.length > 0;

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <h1 className="text-4xl font-semibold text-white">サブスクリプション一覧</h1>
      {hasSubscriptions ? (
        <SubscriptionListTable subscriptions={subscriptions} />
      ) : (
        <SubscriptionsEmptyState />
      )}
    </div>
  );
}
