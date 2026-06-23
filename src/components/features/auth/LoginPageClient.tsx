"use client";

import { useBfcacheRemountKey } from "@/hooks/use-bfcache-remount-key";
import { LoginForm } from "./LoginForm";
import { LoginPageAlerts } from "./LoginPageAlerts";

type LoginPageClientProps = {
  errorMessage: string | null;
  verifiedMessage: string | null;
};

export function LoginPageClient({
  errorMessage,
  verifiedMessage,
}: LoginPageClientProps) {
  const remountKey = useBfcacheRemountKey();

  return (
    <>
      <LoginPageAlerts
        key={`login-alerts-${remountKey}`}
        errorMessage={errorMessage}
        verifiedMessage={verifiedMessage}
      />
      <LoginForm key={`login-form-${remountKey}`} />
    </>
  );
}
