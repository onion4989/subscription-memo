import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email";
import {
  collectKnownLinkedOAuthProviderIds,
  LOGIN_OAUTH_NOT_LINKED_QUERY,
} from "@/lib/oauth-account-not-linked";
import {
  AUTH_ERROR_QUERY,
  ROUTES,
  loginUrlWithSearchParams,
} from "@/lib/routes";
import {
  isOAuthProvider,
  markOAuthEmailVerifiedIfNeeded,
} from "@/lib/auth/mark-oauth-email-verified";
import { evaluateOAuthSignInGuard } from "@/lib/auth/oauth-sign-in-guards";
import { readSessionJwt } from "@/lib/auth/read-session-jwt";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: ROUTES.login,
  },
  events: {
    async session({ session, token }) {
      console.log("[auth:events] session", {
        email: session.user?.email ?? null,
        tokenSub: token?.sub ?? null,
        expires: session.expires ?? null,
      });
    },
    async signIn({ user, account, isNewUser }) {
      if (user.id && isOAuthProvider(account?.provider)) {
        await markOAuthEmailVerifiedIfNeeded(user.id);
      }

      console.log("[auth:events] signIn", {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },
  },
  providers: [
    Google,
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = normalizeEmail(parsed.data.email);
        const { password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (!user || !user.passwordHash) return null;

        const hasOAuthOnly =
          user.accounts.length > 0 && !user.passwordHash;
        if (hasOAuthOnly) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        if (!user.emailVerified) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      if (account.provider !== "credentials") {
        const oauthEmail = user.email
          ? normalizeEmail(user.email)
          : undefined;
        if (!oauthEmail) {
          return false;
        }

        const sessionJwt = await readSessionJwt();
        const existingUser = await prisma.user.findUnique({
          where: { email: oauthEmail },
          include: { accounts: true },
        });

        const accountRow = account.providerAccountId
          ? await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              select: {
                userId: true,
                user: { select: { email: true } },
              },
            })
          : null;

        const guard = evaluateOAuthSignInGuard({
          oauthEmail,
          sessionUserId: sessionJwt.userId,
          sessionEmail: sessionJwt.email
            ? normalizeEmail(sessionJwt.email)
            : null,
          existingEmail: existingUser?.email
            ? normalizeEmail(existingUser.email)
            : null,
          accountUserId: accountRow?.userId ?? null,
          accountEmail: accountRow?.user.email
            ? normalizeEmail(accountRow.user.email)
            : null,
        });

        if (!guard.ok) {
          return loginUrlWithSearchParams({ error: guard.error });
        }

        if (existingUser) {
          const hasProvider = existingUser.accounts.some(
            (a: { provider: string }) => a.provider === account.provider
          );
          if (!hasProvider) {
            const linkedIds = collectKnownLinkedOAuthProviderIds(
              existingUser.accounts
            );
            const hasPassword = Boolean(existingUser.passwordHash);
            return loginUrlWithSearchParams({
              error: AUTH_ERROR_QUERY.OAuthAccountNotLinked,
              [LOGIN_OAUTH_NOT_LINKED_QUERY.linkedProviders]:
                linkedIds.length > 0 ? linkedIds.join(",") : undefined,
              [LOGIN_OAUTH_NOT_LINKED_QUERY.credentialLogin]: hasPassword
                ? "1"
                : undefined,
            });
          }
        }
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update") {
        const updatePayload = session as
          | { user?: { mfaVerified?: boolean; totpEnabled?: boolean } }
          | undefined;
        if (updatePayload?.user?.mfaVerified === true) {
          token.mfaVerified = true;
        }
        if (updatePayload?.user?.totpEnabled === false) {
          token.totpEnabled = false;
          token.mfaVerified = true;
        }
        return token;
      }

      if (user?.id) {
        token.sub = user.id;
      }

      if (account?.provider === "credentials" && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { totpEnabled: true },
        });
        const totpEnabled = dbUser?.totpEnabled ?? false;
        token.totpEnabled = totpEnabled;
        token.mfaVerified = !totpEnabled;
      } else if (account) {
        token.totpEnabled = false;
        token.mfaVerified = true;
      }

      return token;
    },
    async session({ session, token }) {
      const jwt = token as {
        sub?: string;
        totpEnabled?: boolean;
        mfaVerified?: boolean;
      };

      if (session.user) {
        session.user.id = jwt.sub ?? "";
        session.user.totpEnabled = jwt.totpEnabled ?? false;
        session.user.mfaVerified = jwt.mfaVerified ?? true;
      }
      return session;
    },
  },
});
