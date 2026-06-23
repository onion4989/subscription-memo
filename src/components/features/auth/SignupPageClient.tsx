"use client";

import { useBfcacheRemountKey } from "@/hooks/use-bfcache-remount-key";
import { SignupForm } from "./SignupForm";

export function SignupPageClient() {
  const remountKey = useBfcacheRemountKey();

  return <SignupForm key={`signup-form-${remountKey}`} />;
}
