import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PROXY_IGNORED_PATH_PREFIXES,
  PROXY_PUBLIC_PATH_PREFIXES,
  ROUTES,
} from "@/lib/routes";

function isPublicPath(pathname: string): boolean {
  return (
    PROXY_PUBLIC_PATH_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    ) ||
    PROXY_IGNORED_PATH_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");
  const authToken = request.cookies.get("authjs.session-token")?.value;
  const secureAuthToken = request.cookies.get("__Secure-authjs.session-token")?.value;

  console.log("[proxy]", {
    path: pathname,
    host,
    hasAuthjs: Boolean(authToken),
    hasSecureAuthjs: Boolean(secureAuthToken),
  });

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionToken) {
    console.log("[proxy] redirect->login (session missing)", {
      path: pathname,
      host,
    });
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Next.js は `config.matcher` をビルド時に静的解析するため、外部定数にできない
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
