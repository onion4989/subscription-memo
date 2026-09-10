import { LoginPageClient } from "@/components/features/auth/LoginPageClient";
import { AUTH_PAGE_MAIN_CLASS } from "@/lib/auth-page-shell";
import {
  LOGIN_OAUTH_NOT_LINKED_QUERY,
  resolveOAuthAccountNotLinkedMessageFromQuery,
} from "@/lib/oauth-account-not-linked";
import { AUTH_ERROR_QUERY, LOGIN_VERIFIED_QUERY } from "@/lib/routes";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    callbackUrl?: string;
    linkedProviders?: string;
    credentialLogin?: string;
    verified?: string;
  }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "このメールアドレスは既に別の方法で登録されています。元の方法でログインしてください。",
  OAuthWhileSignedIn:
    "別のアカウントでログイン中です。一度ログアウトしてから、Google / GitHub でログインしてください。",
  OAuthDemoForbidden:
    "デモアカウントでは Google / GitHub ログインは利用できません。デモはメールとパスワードでログインしてください。",
  CredentialsSignin: "メールアドレスまたはパスワードが正しくありません。",
  Default: "ログイン中にエラーが発生しました。もう一度お試しください。",
};

function resolveLoginErrorMessage(
  error: string | undefined,
  searchParams: Awaited<LoginPageProps["searchParams"]>
): string | null {
  if (!error) return null;
  if (error === AUTH_ERROR_QUERY.OAuthAccountNotLinked) {
    const specific = resolveOAuthAccountNotLinkedMessageFromQuery({
      linkedProviders: searchParams[LOGIN_OAUTH_NOT_LINKED_QUERY.linkedProviders],
      credentialLogin: searchParams[LOGIN_OAUTH_NOT_LINKED_QUERY.credentialLogin],
    });
    return specific ?? ERROR_MESSAGES.OAuthAccountNotLinked;
  }
  return ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;
}

function resolveVerifiedMessage(verified: string | undefined): string | null {
  if (verified === "1") {
    return "メールアドレスの確認が完了しました。ログインしてください。";
  }
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const errorMessage = resolveLoginErrorMessage(sp.error, sp);
  const verifiedMessage = resolveVerifiedMessage(sp[LOGIN_VERIFIED_QUERY]);

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <LoginPageClient
        errorMessage={errorMessage}
        verifiedMessage={verifiedMessage}
      />
    </main>
  );
}
