import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      totpEnabled: boolean;
      mfaVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    totpEnabled?: boolean;
    mfaVerified?: boolean;
  }
}
