import { SignupForm } from "@/components/features/auth/SignupForm";
import { AUTH_PAGE_MAIN_CLASS } from "@/lib/auth-page-shell";

export default function SignupPage() {
  return (
    <main className={AUTH_PAGE_MAIN_CLASS}>
      <SignupForm />
    </main>
  );
}
