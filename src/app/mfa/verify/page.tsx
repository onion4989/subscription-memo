import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isMfaVerificationPending } from "@/lib/auth/mfa-session";
import { MfaVerifyClient } from "@/components/features/mfa/MfaVerifyClient";
import { ROUTES } from "@/lib/routes";

export default async function MfaVerifyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  if (!session.user.totpEnabled) {
    redirect(ROUTES.subscriptions);
  }

  if (!isMfaVerificationPending(session)) {
    redirect(ROUTES.subscriptions);
  }

  return <MfaVerifyClient />;
}
