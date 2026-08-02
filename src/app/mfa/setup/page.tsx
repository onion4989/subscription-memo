import { initMfaSetup } from "@/lib/actions/mfa-setup";
import { MfaSetupClient } from "@/components/features/mfa/MfaSetupClient";
import { auth } from "@/lib/auth";
import { isMfaVerificationPending } from "@/lib/auth/mfa-session";
import { isDemoUserEmail } from "@/lib/demo/constants";
import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

export default async function MfaSetupPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  if (isDemoUserEmail(session.user.email)) {
    redirect(ROUTES.settings);
  }

  if (isMfaVerificationPending(session)) {
    redirect(ROUTES.mfaVerify);
  }

  const setupData = await initMfaSetup();

  return <MfaSetupClient initialSetupData={setupData} />;
}
