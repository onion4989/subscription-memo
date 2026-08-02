import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  auth,
  signOut,
  findUniqueUser,
  deleteUser,
  deleteManyVerificationTokens,
  sendPlainTextEmail,
  compare,
  redirect,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  signOut: vi.fn(),
  findUniqueUser: vi.fn(),
  deleteUser: vi.fn(),
  deleteManyVerificationTokens: vi.fn(),
  sendPlainTextEmail: vi.fn(),
  compare: vi.fn(),
  redirect: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT:${url}`);
    throw error;
  }),
}));

vi.mock("@/lib/auth", () => ({
  auth,
  signOut,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUniqueUser,
      delete: deleteUser,
    },
    verificationToken: {
      deleteMany: deleteManyVerificationTokens,
    },
  },
}));

vi.mock("@/lib/email/smtp", () => ({
  sendPlainTextEmail,
}));

vi.mock("bcryptjs", () => ({
  compare,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import { deleteAccount } from "@/lib/actions/delete-account";
import {
  ACCOUNT_DELETE_CONFIRMATION_PHRASE,
  ACCOUNT_DELETION_EMAIL_SUBJECT,
} from "@/lib/account-deletion/constants";
import {
  DEMO_ACCOUNT_GUARD_MESSAGE,
  DEMO_USER_EMAIL,
} from "@/lib/demo/constants";
import { ROUTES } from "@/lib/routes";

const initialState = { success: false };

function formDataFrom(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

async function expectRedirectHome(
  run: () => Promise<unknown>
): Promise<void> {
  await expect(run()).rejects.toThrow(`NEXT_REDIRECT:${ROUTES.home}`);
  expect(redirect).toHaveBeenCalledWith(ROUTES.home);
}

describe("deleteAccount (AD2–AD7)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signOut.mockResolvedValue(undefined);
    deleteUser.mockResolvedValue({});
    deleteManyVerificationTokens.mockResolvedValue({ count: 0 });
    sendPlainTextEmail.mockResolvedValue(undefined);
    compare.mockResolvedValue(true);
  });

  it("AD2: rejects unauthenticated requests", async () => {
    auth.mockResolvedValueOnce(null);

    await expect(
      deleteAccount(initialState, formDataFrom({}))
    ).resolves.toEqual({
      success: false,
      error: "認証が必要です。",
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("AD3: rejects wrong password for password users", async () => {
    auth.mockResolvedValueOnce({ user: { id: "user-1" } });
    findUniqueUser.mockResolvedValueOnce({
      email: "user@example.com",
      name: "太郎",
      passwordHash: "hashed",
    });
    compare.mockResolvedValueOnce(false);

    await expect(
      deleteAccount(initialState, formDataFrom({ password: "wrong" }))
    ).resolves.toEqual({
      success: false,
      error: "現在のパスワードが正しくありません。",
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("AD4: deletes password user, sends email, signs out, redirects home", async () => {
    auth.mockResolvedValueOnce({ user: { id: "user-1" } });
    findUniqueUser.mockResolvedValueOnce({
      email: "user@example.com",
      name: "太郎",
      passwordHash: "hashed",
    });

    await expectRedirectHome(() =>
      deleteAccount(initialState, formDataFrom({ password: "correct" }))
    );

    expect(compare).toHaveBeenCalledWith("correct", "hashed");
    expect(deleteUser).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(sendPlainTextEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: ACCOUNT_DELETION_EMAIL_SUBJECT,
      })
    );
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });

  it("AD5: rejects wrong confirmation phrase for passwordless users", async () => {
    auth.mockResolvedValueOnce({ user: { id: "user-2" } });
    findUniqueUser.mockResolvedValueOnce({
      email: "oauth@example.com",
      name: null,
      passwordHash: null,
    });

    await expect(
      deleteAccount(
        initialState,
        formDataFrom({ confirmationPhrase: "違う文言" })
      )
    ).resolves.toEqual({
      success: false,
      error: `確認のため「${ACCOUNT_DELETE_CONFIRMATION_PHRASE}」と入力してください。`,
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("AD6: deletes passwordless user when phrase matches", async () => {
    auth.mockResolvedValueOnce({ user: { id: "user-2" } });
    findUniqueUser.mockResolvedValueOnce({
      email: "oauth@example.com",
      name: null,
      passwordHash: null,
    });

    await expectRedirectHome(() =>
      deleteAccount(
        initialState,
        formDataFrom({
          confirmationPhrase: `  ${ACCOUNT_DELETE_CONFIRMATION_PHRASE}  `,
        })
      )
    );

    expect(deleteUser).toHaveBeenCalledWith({ where: { id: "user-2" } });
    expect(sendPlainTextEmail).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });

  it("AD7: still redirects home when confirmation email fails", async () => {
    auth.mockResolvedValueOnce({ user: { id: "user-1" } });
    findUniqueUser.mockResolvedValueOnce({
      email: "user@example.com",
      name: "太郎",
      passwordHash: "hashed",
    });
    sendPlainTextEmail.mockRejectedValueOnce(new Error("SMTP down"));

    await expectRedirectHome(() =>
      deleteAccount(initialState, formDataFrom({ password: "correct" }))
    );

    expect(deleteUser).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  it("デモアカウントの削除を拒否する", async () => {
    auth.mockResolvedValueOnce({ user: { id: "demo-user" } });
    findUniqueUser.mockResolvedValueOnce({
      email: DEMO_USER_EMAIL,
      name: "デモ",
      passwordHash: "hashed",
    });

    await expect(
      deleteAccount(initialState, formDataFrom({ password: "demo1234" }))
    ).resolves.toEqual({
      success: false,
      error: DEMO_ACCOUNT_GUARD_MESSAGE,
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
