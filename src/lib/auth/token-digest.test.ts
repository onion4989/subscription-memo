import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { digestToken } from "@/lib/auth/token-digest";

describe("digestToken", () => {
  it("returns a stable 64-char sha256 hex", () => {
    const raw = "abc123";
    const expected = createHash("sha256").update(raw, "utf8").digest("hex");

    expect(digestToken(raw)).toBe(expected);
    expect(digestToken(raw)).toBe(digestToken(raw));
    expect(digestToken(raw)).toHaveLength(64);
  });

  it("differs for different inputs", () => {
    expect(digestToken("one")).not.toBe(digestToken("two"));
  });
});
