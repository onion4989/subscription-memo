import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { initMfaSetup, refresh } = vi.hoisted(() => ({
  initMfaSetup: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/actions/mfa-setup", () => ({
  initMfaSetup,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

// 実際の登録フローは Server Action を伴うため、完了通知だけを再現する
vi.mock("@/components/features/mfa/MfaSetupFlow", () => ({
  MfaSetupFlow: ({ onComplete }: { onComplete?: () => void }) => (
    <button type="button" onClick={onComplete}>
      設定完了とする
    </button>
  ),
}));

import { MfaSettingsDialog } from "@/components/features/settings/MfaSettingsDialog";

const ENABLED_DESCRIPTION =
  "二段階認証は有効です。ログイン時に認証アプリの 6 桁コードが必要です。";

function openDialog(): Promise<void> {
  return userEvent.click(screen.getByRole("button", { name: "MFA を設定する" }));
}

describe("MfaSettingsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMfaSetup.mockResolvedValue({
      step: "verify",
      secret: "SECRET",
      uri: "otpauth://totp/x",
      email: "user@example.com",
    });
  });

  it("未設定のときは登録フローを表示する", async () => {
    render(<MfaSettingsDialog totpEnabled={false} />);

    await openDialog();

    expect(await screen.findByText("設定完了とする")).toBeInTheDocument();
    expect(screen.queryByText(ENABLED_DESCRIPTION)).not.toBeInTheDocument();
  });

  it("設定済みのときは有効である旨だけを表示する", async () => {
    render(<MfaSettingsDialog totpEnabled />);

    await openDialog();

    expect(await screen.findByText(ENABLED_DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByText("設定完了とする")).not.toBeInTheDocument();
    expect(initMfaSetup).not.toHaveBeenCalled();
  });

  it("解除後は有効表示を持ち越さず、登録フローに戻る", async () => {
    const { rerender } = render(<MfaSettingsDialog totpEnabled={false} />);

    await openDialog();
    await userEvent.click(await screen.findByText("設定完了とする"));

    // router.refresh() でサーバー側の値が有効になり、その後の解除で無効に戻る
    rerender(<MfaSettingsDialog totpEnabled />);
    rerender(<MfaSettingsDialog totpEnabled={false} />);

    await openDialog();

    expect(await screen.findByText("設定完了とする")).toBeInTheDocument();
    expect(screen.queryByText(ENABLED_DESCRIPTION)).not.toBeInTheDocument();
  });
});
