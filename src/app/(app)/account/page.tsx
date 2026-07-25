import { redirect } from "next/navigation";
import { AccountDeleteSection } from "@/components/features/account/AccountDeleteSection";
import { ProfileForm } from "@/components/features/account/ProfileForm";
import { isOAuthProvider } from "@/lib/auth/mark-oauth-email-verified";
import { getAuthenticatedUserId } from "@/lib/auth/get-user-id";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/routes";
import { toProfileFormValues } from "@/schemas/profile";

export default async function AccountPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect(ROUTES.login);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phoneNumber: true,
      avatarId: true,
      passwordHash: true,
      accounts: {
        select: { provider: true },
      },
    },
  });

  if (!user) {
    redirect(ROUTES.login);
  }

  const emailReadonly = user.accounts.some((account) =>
    isOAuthProvider(account.provider)
  );
  const hasPassword = Boolean(user.passwordHash);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">プロフィール</h1>
        <p className="mt-2 text-sm text-white/80">
          プロフィールでは、お知らせ機能を利用したり新しいパスワードなどを発行することができます。
        </p>
      </div>

      <ProfileForm
        initialValues={toProfileFormValues({
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatarId: user.avatarId,
          emailReadonly,
          hasPassword,
        })}
      />

      <AccountDeleteSection hasPassword={hasPassword} />
    </div>
  );
}
