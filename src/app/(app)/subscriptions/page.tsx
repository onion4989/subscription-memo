import { redirect } from "next/navigation";
import { SubscriptionsEmptyState } from "@/components/features/subscription/SubscriptionsEmptyState";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { getUserSubscriptionCount } from "@/lib/subscription/queries";
import { ROUTES } from "@/lib/routes";

export default async function SubscriptionsPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(ROUTES.login);
  }

  const subscriptionCount = await getUserSubscriptionCount(userId);
  const hasSubscriptions = subscriptionCount > 0;

  return (
    <div className="flex w-full min-w-0 max-w-3xl flex-col gap-8">
      <h1 className="text-4xl font-semibold text-white">サブスクリプション一覧</h1>
      {hasSubscriptions ? null : <SubscriptionsEmptyState />}
    </div>
  );
}
