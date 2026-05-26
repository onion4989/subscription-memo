"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { AUTH_CARD_MAX_WIDTH_CLASS } from "@/lib/auth-page-shell";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Social } from "./Social";
import { BackButton } from "./BackButton";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card
      className={cn(
        "mx-auto min-w-0 shadow-md sm:min-w-[360px]",
        AUTH_CARD_MAX_WIDTH_CLASS
      )}
    >
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
}