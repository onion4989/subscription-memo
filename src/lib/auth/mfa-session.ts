import type { Session } from "next-auth";

export function isMfaVerificationPending(
  session: Session | null | undefined
): boolean {
  if (!session?.user) {
    return false;
  }

  return session.user.totpEnabled && !session.user.mfaVerified;
}
