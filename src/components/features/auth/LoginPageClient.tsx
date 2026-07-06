"use client";

import { useBfcacheRemountKey } from "@/hooks/use-bfcache-remount-key";
import {
  AUTH_CARD_MAX_WIDTH_CLASS,
  AUTH_PAGE_CONTENT_CLASS,
} from "@/lib/auth-page-shell";
import { cn } from "@/lib/utils";
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
    <div
      className={cn(AUTH_PAGE_CONTENT_CLASS, AUTH_CARD_MAX_WIDTH_CLASS)}
    >
      <LoginPageAlerts
        key={`login-alerts-${remountKey}`}
        errorMessage={errorMessage}
        verifiedMessage={verifiedMessage}
      />
      <LoginForm key={`login-form-${remountKey}`} />
    </div>
  );
}
