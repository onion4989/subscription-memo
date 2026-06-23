"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { AUTH_CARD_MAX_WIDTH_CLASS } from "@/lib/auth-page-shell";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Social } from "./Social";
import { BackButton } from "./BackButton";

interface CardWrapperProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonHref?: string;
  secondaryBackButtonLabel?: string;
  secondaryBackButtonHref?: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerTitle = "ログイン認証",
  headerLabel,
  backButtonLabel,
  backButtonHref,
  secondaryBackButtonLabel,
  secondaryBackButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card
      className={cn(
        "mx-auto min-w-0 sm:min-w-[360px]",
        AUTH_CARD_MAX_WIDTH_CLASS
      )}
    >
      <CardHeader>
        <Header title={headerTitle} label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      {backButtonLabel && backButtonHref ? (
        <CardFooter>
          <BackButton
            label={backButtonLabel}
            href={backButtonHref}
          />
        </CardFooter>
      ) : null}
      {secondaryBackButtonLabel && secondaryBackButtonHref ? (
        <CardFooter className="pt-0">
          <BackButton
            label={secondaryBackButtonLabel}
            href={secondaryBackButtonHref}
          />
        </CardFooter>
      ) : null}
    </Card>
  );
}