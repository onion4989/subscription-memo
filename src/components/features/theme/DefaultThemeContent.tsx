import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DefaultThemeContentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * アカウント／各種設定の右コンテンツ用。
 * ページ背景は ColorThemeProvider 側でデフォルト固定するため、
 * ここでは以前どおり白文字ベースのレイアウトのみ担う。
 */
export function DefaultThemeContent({
  children,
  className,
}: DefaultThemeContentProps) {
  return (
    <div
      data-theme-scope="default"
      className={cn(
        "flex w-full min-w-0 flex-col gap-6 text-white",
        className
      )}
    >
      {children}
    </div>
  );
}
