import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/features/auth/SignOutButton";

export default async function SuccessPage() {
  const session = await auth();

  console.log("[success]", {
    hasSession: Boolean(session),
    userId: session?.user?.id ?? null,
    email: session?.user?.email ?? null,
  });

  if (!session) {
    console.log("[success] redirect->login (no session)");
    redirect(ROUTES.login);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Login Success!
      </h1>
      <p className="text-gray-600 mb-8">
        ようこそ、{session.user?.name ?? session.user?.email} さん
      </p>
      <SignOutButton />
    </main>
  );
}
