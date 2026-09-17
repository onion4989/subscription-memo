import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AVATAR_IDS,
  avatarImagePath,
  isAvatarId,
} from "@/lib/user/avatar";
import {
  PROXY_PUBLIC_PATH_PREFIXES,
  ROUTES,
  loginUrlWithSearchParams,
} from "@/lib/routes";
import { cn } from "@/lib/utils";
import { shouldBlockSearchIndexing } from "@/lib/search-indexing";

describe("avatar helpers (V1)", () => {
  it("validates avatar ids and builds image paths", () => {
    expect(isAvatarId(AVATAR_IDS[0])).toBe(true);
    expect(isAvatarId(0)).toBe(false);
    expect(avatarImagePath(3)).toBe("/assets/common/img_c_avatar_03.jpg");
  });
});

describe("routes helpers (V2)", () => {
  it("builds login URLs with search params", () => {
    expect(loginUrlWithSearchParams({})).toBe(ROUTES.login);
    expect(
      loginUrlWithSearchParams({ error: "OAuthAccountNotLinked", verified: "1" })
    ).toBe(`${ROUTES.login}?error=OAuthAccountNotLinked&verified=1`);
  });

  it("includes key public path prefixes for proxy", () => {
    expect(PROXY_PUBLIC_PATH_PREFIXES).toContain(ROUTES.login);
    expect(PROXY_PUBLIC_PATH_PREFIXES).toContain(ROUTES.signup);
    expect(PROXY_PUBLIC_PATH_PREFIXES).toContain(ROUTES.apiAuth);
  });

  it("exposes the manifest to unauthenticated browsers", () => {
    // `.webmanifest` は proxy の matcher の除外拡張子に入らないため、公開パスから漏れるとログインへ飛ぶ
    expect(PROXY_PUBLIC_PATH_PREFIXES).toContain("/manifest.webmanifest");
  });
});

describe("shouldBlockSearchIndexing (V3)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads BLOCK_SEARCH_INDEXING", () => {
    vi.stubEnv("BLOCK_SEARCH_INDEXING", "true");
    expect(shouldBlockSearchIndexing()).toBe(true);

    vi.stubEnv("BLOCK_SEARCH_INDEXING", "false");
    expect(shouldBlockSearchIndexing()).toBe(false);
  });
});

describe("cn (V5)", () => {
  it("merges class names", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });
});
