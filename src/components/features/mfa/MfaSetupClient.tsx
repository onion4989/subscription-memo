"use client";

import type { ReactNode } from "react";
import { MfaSetupFlow } from "@/components/features/mfa/MfaSetupFlow";
import { MFA_SETUP_ENROLLMENT_DESCRIPTION } from "@/components/features/mfa/mfa-setup-shared";
import type { MfaSetupState } from "@/lib/actions/mfa-setup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import {
  AUTH_CARD_MAX_WIDTH_CLASS,
  AUTH_PAGE_MAIN_CLASS,
} from "@/lib/auth-page-shell";

type MfaSetupClientProps = {
  initialSetupData: MfaSetupState;
};

function MfaSetupPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <Card className={AUTH_CARD_MAX_WIDTH_CLASS}>
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </main>
  );
}

export function MfaSetupClient({ initialSetupData }: MfaSetupClientProps) {
  if (initialSetupData.error && initialSetupData.step !== "verify") {
    return (
      <MfaSetupPageShell title="MFA設定">
        <p className="text-center text-sm text-red-600">
          {initialSetupData.error}
        </p>
      </MfaSetupPageShell>
    );
  }

  return (
    <MfaSetupPageShell
      title="MFA設定"
      description={MFA_SETUP_ENROLLMENT_DESCRIPTION}
    >
      <MfaSetupFlow
        initialSetupData={initialSetupData}
        tokenInputId="mfa-setup-page-token"
        onComplete={() => {
          window.location.href = ROUTES.subscriptions;
        }}
      />
    </MfaSetupPageShell>
  );
}
