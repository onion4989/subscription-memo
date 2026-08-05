import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ColorThemeProvider } from "@/components/providers/ColorThemeProvider";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <ColorThemeProvider initialThemeId="default">{children}</ColorThemeProvider>
  );
}

export function renderWithColorTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: Wrapper, ...options });
}
