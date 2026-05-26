import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect(ROUTES.success);
  }

  redirect(ROUTES.login);
}
