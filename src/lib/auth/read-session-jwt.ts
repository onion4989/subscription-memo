import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export type SessionJwtInfo = {
  userId: string | null;
  email: string | null;
};

/**
 * 現在リクエストの Auth.js JWT を読む（signIn 中の「既存セッション」検出用）。
 * `auth()` は同一設定内で再入しやすいため getToken を使う。
 */
export async function readSessionJwt(): Promise<SessionJwtInfo> {
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (!cookieHeader) {
    return { userId: null, email: null };
  }

  const token = await getToken({
    req: { headers: { cookie: cookieHeader } },
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    return { userId: null, email: null };
  }

  const email = typeof token.email === "string" ? token.email : null;
  return {
    userId: typeof token.sub === "string" ? token.sub : null,
    email,
  };
}
