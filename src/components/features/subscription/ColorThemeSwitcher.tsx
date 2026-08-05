"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useColorTheme } from "@/components/providers/ColorThemeProvider";
import {
  COLOR_THEME_LIST,
  getThemePreviewColors,
  type ColorThemeId,
} from "@/lib/theme/themes";
import { cn } from "@/lib/utils";

export function ColorThemeSwitcher() {
  const { themeId, theme, setThemeId, isPending } = useColorTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          aria-label="カラーテーマを選択"
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-medium",
            "text-[color:var(--app-fg)] transition-opacity hover:opacity-80",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          <span className="max-w-[7.5rem] truncate sm:max-w-none">
            {theme.label}
          </span>
          <span className="whitespace-nowrap">テーマ</span>
          <ChevronDown className="size-4 shrink-0 opacity-80" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="z-[60] w-[min(100vw-2rem,20rem)] border border-black/10 bg-white p-2 text-black shadow-lg"
      >
        <ul className="flex max-h-[min(70vh,24rem)] flex-col gap-0.5 overflow-y-auto">
          {COLOR_THEME_LIST.map((item) => {
            const selected = item.id === themeId;
            const preview = getThemePreviewColors(item);

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setThemeId(item.id as ColorThemeId)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                    "hover:bg-black/5",
                    selected && "bg-black/5"
                  )}
                >
                  <span className="flex w-5 shrink-0 justify-center">
                    {selected ? (
                      <Check className="size-4" aria-hidden />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {item.label}
                  </span>
                  <span
                    className="flex shrink-0 overflow-hidden rounded-[2px] border border-black"
                    aria-hidden
                  >
                    {preview.map((color, index) => (
                      <span
                        key={`${item.id}-${index}`}
                        className="size-4"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
