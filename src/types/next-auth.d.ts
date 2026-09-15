import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    /** Credentials authorize が JWT 用に渡す。OAuth では未設定 */
    totpEnabled?: boolean;
  }

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
