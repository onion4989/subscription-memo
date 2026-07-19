import { describe, expect, it } from "vitest";
import {
  buildOAuthAccountNotLinkedDisplayMessage,
  collectKnownLinkedOAuthProviderIds,
  parseLinkedOAuthProvidersQuery,
  resolveOAuthAccountNotLinkedMessageFromQuery,
} from "@/lib/oauth-account-not-linked";

describe("OAuth not-linked helpers (O1–O2)", () => {
  it("collects known providers without duplicates", () => {
    expect(
      collectKnownLinkedOAuthProviderIds([
        { provider: "google" },
        { provider: "credentials" },
        { provider: "google" },
        { provider: "github" },
      ])
    ).toEqual(["google", "github"]);
  });

  it("parses linkedProviders query values", () => {
    expect(parseLinkedOAuthProvidersQuery(undefined)).toEqual([]);
    expect(parseLinkedOAuthProvidersQuery("google,github,unknown")).toEqual([
      "google",
      "github",
    ]);
  });

  it("builds display messages for each branch", () => {
    expect(buildOAuthAccountNotLinkedDisplayMessage([], false)).toBeNull();

    expect(buildOAuthAccountNotLinkedDisplayMessage(["google"], false)).toBe(
      "このアカウントはすでに Google で登録されています。Google でログインしてください。"
    );

    expect(
      buildOAuthAccountNotLinkedDisplayMessage(["google", "github"], false)
    ).toContain("Google または GitHub");

    expect(buildOAuthAccountNotLinkedDisplayMessage([], true)).toBe(
      "このアカウントはすでにメールアドレスとパスワードで登録されています。メールアドレスとパスワードでログインしてください。"
    );

    expect(
      buildOAuthAccountNotLinkedDisplayMessage(["google"], true)
    ).toContain("Google、またはメールアドレスとパスワード");
  });

  it("resolves message from login query params", () => {
    expect(
      resolveOAuthAccountNotLinkedMessageFromQuery({
        linkedProviders: "google",
        credentialLogin: "1",
      })
    ).toContain("Google");
  });
});
