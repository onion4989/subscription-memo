import { describe, expect, it } from "vitest";
import {
  ACCOUNT_DELETE_CONFIRMATION_PHRASE,
  ACCOUNT_DELETION_EMAIL_SUBJECT,
  buildAccountDeletionEmailText,
} from "@/lib/account-deletion/constants";

describe("account deletion email (AD1)", () => {
  it("uses the agreed subject and confirmation phrase", () => {
    expect(ACCOUNT_DELETION_EMAIL_SUBJECT).toBe(
      "【サブスクMEMO】アカウント削除完了のお知らせ"
    );
    expect(ACCOUNT_DELETE_CONFIRMATION_PHRASE).toBe("アカウントを削除する");
  });

  it("builds the deletion confirmation body with display name fallback", () => {
    const named = buildAccountDeletionEmailText({ displayName: "太郎" });
    expect(named).toContain("太郎 様");
    expect(named).toContain("サブスクMEMOのアカウント削除が完了しました。");
    expect(named).toContain("このメールアドレスではログインできなくなります。");

    const guest = buildAccountDeletionEmailText({ displayName: null });
    expect(guest).toContain("ゲスト 様");
  });
});
