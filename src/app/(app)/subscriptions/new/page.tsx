import { redirect } from "next/navigation";
import { SubscriptionRegistrationForm } from "@/components/features/subscription/SubscriptionRegistrationForm";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { getUserSubscriptions } from "@/lib/subscription/queries";
import { ROUTES } from "@/lib/routes";

export default async function SubscriptionsNewPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(ROUTES.login);
  }

  const savedSubscriptions = await getUserSubscriptions(userId);

  return (
    <div className="flex w-full min-w-0 flex-col">
      <h1 className="sr-only">サブスクリプション登録・変更</h1>
      <SubscriptionRegistrationForm initialSaved={savedSubscriptions} />
    </div>
  );
}
