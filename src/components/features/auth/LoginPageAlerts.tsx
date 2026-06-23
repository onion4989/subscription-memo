"use client";

import {
  AUTH_CARD_MAX_WIDTH_CLASS,
} from "@/lib/auth-page-shell";
import { cn } from "@/lib/utils";

type LoginPageAlertsProps = {
  errorMessage: string | null;
  verifiedMessage: string | null;
};

export function LoginPageAlerts({
  errorMessage,
  verifiedMessage,
}: LoginPageAlertsProps) {
  return (
    <>
      {verifiedMessage ? (
        <div
          className={cn(
            "mb-4 rounded-md border border-green-200 bg-green-50 p-3",
            AUTH_CARD_MAX_WIDTH_CLASS
          )}
        >
          <p className="text-sm text-green-800">{verifiedMessage}</p>
        </div>
      ) : null}
      {errorMessage ? (
        <div
          className={cn(
            "mb-4 rounded-md border border-red-200 bg-red-50 p-3",
            AUTH_CARD_MAX_WIDTH_CLASS
          )}
        >
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      ) : null}
    </>
  );
}
