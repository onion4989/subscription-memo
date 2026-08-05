import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/subscriptions",
}));

vi.mock("@/lib/actions/update-color-theme", () => ({
  updateColorTheme: vi.fn(async () => ({ success: true, themeId: "default" })),
}));

vi.mock("@/components/features/subscription/AppSidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}));

vi.mock("@/components/features/subscription/SidebarToggleIcon", () => ({
  SidebarToggleIcon: () => <span>toggle</span>,
}));

import { AppShell } from "@/components/features/subscription/AppShell";
import { ColorThemeProvider } from "@/components/providers/ColorThemeProvider";

describe("AppShell", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("右側コンテンツ領域に max-w-[1000px] を付ける", () => {
    const { container } = render(
      <ColorThemeProvider initialThemeId="default">
        <AppShell displayName="ゲスト" avatarId={1}>
          <div>content</div>
        </AppShell>
      </ColorThemeProvider>
    );

    expect(
      screen.getByText("サブスクリプション一覧")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("カラーテーマを選択")).toBeInTheDocument();

    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section?.className).toMatch(/max-w-\[1000px\]|max-w-250/);
    expect(section).toHaveClass("w-full");

    const header = section?.querySelector(":scope > div");
    expect(header?.className).toMatch(/pr-4/);
    expect(header?.className).toMatch(/md:pr-6/);
  });
});
