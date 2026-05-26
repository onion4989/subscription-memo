import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";
import { AUTH_PAGE_MAIN_CLASS } from "@/lib/auth-page-shell";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <ResetPasswordForm token={token ?? ""} />
    </main>
  );
}
