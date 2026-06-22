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
    <div className="flex w-full min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold text-white">
          サブスクリプション登録・変更
        </h1>
        <p className="text-base text-white/90">
          契約中のサブスクリプションを登録・変更できます。
        </p>
      </div>
      <SubscriptionRegistrationForm initialSaved={savedSubscriptions} />
    </div>
  );
}
