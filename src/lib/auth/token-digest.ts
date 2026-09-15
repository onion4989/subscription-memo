import { createHash } from "node:crypto";

/**
 * URL ワンタイムトークンのルックアップ用ダイジェスト。
 * bcrypt ではなく SHA-256（決定的）なので findUnique できる。
 */
export function digestToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}
