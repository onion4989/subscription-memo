import { describe, expect, it } from "vitest";
import { DEMO_USER_EMAIL } from "@/lib/demo/constants";
import { AUTH_ERROR_QUERY } from "@/lib/routes";
import { evaluateOAuthSignInGuard } from "@/lib/auth/oauth-sign-in-guards";

const base = {
  oauthEmail: "user@gmail.com",
  sessionUserId: null,
  sessionEmail: null,
  existingEmail: null,
  accountUserId: null,
  accountEmail: null,
};

describe("evaluateOAuthSignInGuard", () => {
  it("allows fresh OAuth when logged out", () => {
    expect(evaluateOAuthSignInGuard(base)).toEqual({ ok: true });
  });

  it("allows OAuth re-auth for the same signed-in user", () => {
    expect(
      evaluateOAuthSignInGuard({
        ...base,
        sessionUserId: "user-1",
        sessionEmail: "user@gmail.com",
        accountUserId: "user-1",
        accountEmail: "user@gmail.com",
      })
    ).toEqual({ ok: true });
  });

  it("rejects OAuth link while signed in (A)", () => {
    expect(
      evaluateOAuthSignInGuard({
        ...base,
        sessionUserId: "user-1",
        sessionEmail: "user@example.com",
      })
    ).toEqual({
      ok: false,
      error: AUTH_ERROR_QUERY.OAuthWhileSignedIn,
    });
  });

  it("rejects OAuth when session user differs from account owner (A)", () => {
    expect(
      evaluateOAuthSignInGuard({
        ...base,
        sessionUserId: "user-1",
        sessionEmail: "a@example.com",
        accountUserId: "user-2",
        accountEmail: "b@example.com",
      })
    ).toEqual({
      ok: false,
      error: AUTH_ERROR_QUERY.OAuthWhileSignedIn,
    });
  });

  it("rejects OAuth profile email that is the demo address (B)", () => {
    expect(
      evaluateOAuthSignInGuard({
        ...base,
        oauthEmail: DEMO_USER_EMAIL,
      })
    ).toEqual({
      ok: false,
      error: AUTH_ERROR_QUERY.OAuthDemoForbidden,
    });
  });

  it("rejects when existing email user is demo (B)", () => {
    expect(
      evaluateOAuthSignInGuard({
        ...base,
        existingEmail: DEMO_USER_EMAIL,
      })
    ).toEqual({
      ok: false,
      error: AUTH_ERROR_QUERY.OAuthDemoForbidden,
    });
  });

  it("rejects when Account already belongs to demo (B)", () => {
    expect(
      evaluateOAuthSignInGuard({
        ...base,
        accountUserId: "demo-id",
        accountEmail: DEMO_USER_EMAIL,
      })
    ).toEqual({
      ok: false,
      error: AUTH_ERROR_QUERY.OAuthDemoForbidden,
    });
  });

  it("rejects OAuth while signed in as demo (B)", () => {
    expect(
      evaluateOAuthSignInGuard({
        ...base,
        sessionUserId: "demo-id",
        sessionEmail: DEMO_USER_EMAIL,
        accountUserId: "demo-id",
        accountEmail: DEMO_USER_EMAIL,
      })
    ).toEqual({
      ok: false,
      error: AUTH_ERROR_QUERY.OAuthDemoForbidden,
    });
  });
});
