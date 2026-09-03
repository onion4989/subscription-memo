import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginState } from "@/lib/actions/login";
import { LOGIN_RATE_LIMIT_MESSAGE } from "@/lib/auth/rate-limit-constants";

const actionState = vi.hoisted(() => ({
  current: { success: false } as LoginState,
}));

vi.mock("@/hooks/use-hydrated", () => ({
  useHydrated: () => true,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("@/components/features/auth/CardWrapper", () => ({
  CardWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-wrapper">{children}</div>
  ),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: () => [actionState.current, vi.fn(), false],
  };
});

vi.mock("@/lib/actions/login", () => ({
  login: vi.fn(),
}));

import { LoginForm } from "@/components/features/auth/LoginForm";

describe("LoginForm formError (UI1–UI3)", () => {
  beforeEach(() => {
    actionState.current = { success: false };
  });

  it("UI1: shows formError as a top alert", () => {
    actionState.current = {
      success: false,
      formError: LOGIN_RATE_LIMIT_MESSAGE,
      values: { email: "user@example.com" },
    };

    render(<LoginForm />);

    const form = screen.getByRole("button", { name: "ログイン" }).closest("form");
    expect(form).not.toBeNull();

    const alert = within(form as HTMLElement).getByText(LOGIN_RATE_LIMIT_MESSAGE);
    expect(alert).toBeVisible();
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert.className).toContain("text-sm");
  });


  it("UI2: hides the top alert when formError is absent", () => {
    actionState.current = { success: false };

    render(<LoginForm />);

    expect(screen.queryByText(LOGIN_RATE_LIMIT_MESSAGE)).not.toBeInTheDocument();
  });

  it("UI3: keeps the top alert visible with field errors", () => {
    actionState.current = {
      success: false,
      formError: LOGIN_RATE_LIMIT_MESSAGE,
      fieldErrors: {
        password: "メールアドレスまたはパスワードが正しくありません",
      },
      values: { email: "user@example.com" },
    };

    render(<LoginForm />);

    expect(screen.getByText(LOGIN_RATE_LIMIT_MESSAGE)).toBeVisible();
    expect(
      screen.getByText("メールアドレスまたはパスワードが正しくありません")
    ).toBeVisible();
  });
});
