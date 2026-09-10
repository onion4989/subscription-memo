import { isDemoUserEmail } from "@/lib/demo/constants";
import { AUTH_ERROR_QUERY } from "@/lib/routes";

export type OAuthGuardInput = {
  oauthEmail: string | undefined;
  sessionUserId: string | null;
  sessionEmail: string | null;
  /** 同一メールの既存 User（無ければ null） */
  existingEmail: string | null;
  /** 既存 Account の userId（無ければ null） */
  accountUserId: string | null;
  /** 既存 Account 所有者の email */
  accountEmail: string | null;
};

export type OAuthGuardOk = { ok: true };
export type OAuthGuardFail = {
  ok: false;
  error:
    | typeof AUTH_ERROR_QUERY.OAuthWhileSignedIn
    | typeof AUTH_ERROR_QUERY.OAuthDemoForbidden;
};

export type OAuthGuardResult = OAuthGuardOk | OAuthGuardFail;

/**
 * OAuth signIn 前段ガード。
 * A: ログイン中の新規リンク拒否 / B: デモへの OAuth 拒否
 */
export function evaluateOAuthSignInGuard(
  input: OAuthGuardInput
): OAuthGuardResult {
  if (isDemoUserEmail(input.oauthEmail)) {
    return { ok: false, error: AUTH_ERROR_QUERY.OAuthDemoForbidden };
  }

  if (isDemoUserEmail(input.existingEmail)) {
    return { ok: false, error: AUTH_ERROR_QUERY.OAuthDemoForbidden };
  }

  if (isDemoUserEmail(input.accountEmail)) {
    return { ok: false, error: AUTH_ERROR_QUERY.OAuthDemoForbidden };
  }

  if (isDemoUserEmail(input.sessionEmail)) {
    return { ok: false, error: AUTH_ERROR_QUERY.OAuthDemoForbidden };
  }

  if (input.sessionUserId) {
    if (!input.accountUserId) {
      return { ok: false, error: AUTH_ERROR_QUERY.OAuthWhileSignedIn };
    }
    if (input.accountUserId !== input.sessionUserId) {
      return { ok: false, error: AUTH_ERROR_QUERY.OAuthWhileSignedIn };
    }
  }

  return { ok: true };
}
