import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardWrapper } from "@/components/features/auth/CardWrapper";
import { AUTH_PAGE_MAIN_CLASS } from "@/lib/auth-page-shell";
import { VERIFY_LINK_INVALID_MESSAGE } from "@/lib/email-verification/constants";
import { verifyEmailFromToken } from "@/lib/email-verification/verify-token";
import { ROUTES } from "@/lib/routes";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = await verifyEmailFromToken(token);

  if (result.success) {
    const loginHref = `${ROUTES.login}?verified=1`;

    return (
      <main className={AUTH_PAGE_MAIN_CLASS}>
        <CardWrapper headerLabel="メール確認完了">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              メールアドレスの確認が完了しました。ログインしてください。
            </p>
            <Button asChild className="w-full">
              <Link href={loginHref}>ログインページへ</Link>
            </Button>
          </div>
        </CardWrapper>
      </main>
    );
  }

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <CardWrapper
        headerLabel="リンクが無効です"
        backButtonLabel="ログインページへ"
        backButtonHref={ROUTES.login}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {VERIFY_LINK_INVALID_MESSAGE}
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href={ROUTES.resendVerification}>確認メールを再送</Link>
          </Button>
        </div>
      </CardWrapper>
    </main>
  );
}
