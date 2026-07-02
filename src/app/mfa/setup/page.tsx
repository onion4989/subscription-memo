import { initMfaSetup } from "@/lib/actions/mfa-setup";
import { MfaSetupClient } from "@/components/features/mfa/MfaSetupClient";

export default async function MfaSetupPage() {
  const setupData = await initMfaSetup();

  return <MfaSetupClient initialSetupData={setupData} />;
}
