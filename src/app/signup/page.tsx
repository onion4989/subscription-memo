import { SignupPageClient } from "@/components/features/auth/SignupPageClient";
import { AUTH_PAGE_MAIN_CLASS } from "@/lib/auth-page-shell";

export default function SignupPage() {
  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <SignupPageClient />
    </main>
  );
}
