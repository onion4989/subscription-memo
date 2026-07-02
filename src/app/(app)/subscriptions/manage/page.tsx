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

  return (
    <div className="flex w-full min-w-0 flex-col">
      <h1 className="sr-only">サブスクリプション削除</h1>
      <SubscriptionDeleteForm initialSaved={subscriptions} />
    </div>
  );
}
