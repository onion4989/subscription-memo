import { auth } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  if (session.user.id) {
    return session.user.id;
  }

  if (!session.user.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(session.user.email) },
    select: { id: true },
  });

  return user?.id ?? null;
}
