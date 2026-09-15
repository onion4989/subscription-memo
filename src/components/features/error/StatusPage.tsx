import Link from "next/link";
import { Noto_Sans_JP } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["700", "900"],
});

const DEFAULT_BG_CLASS =
  "bg-linear-to-b from-[#000000] to-[#06648F]" as const;

const ERROR_BG_STYLE = {
  backgroundImage:
    "linear-gradient(to bottom, #000000 0%, #1C4B6A 50%, #000000 100%)",
} as const;

type StatusPageProps = Readonly<{
  code: string;
  title: string;
  messages: readonly [string, string];
  background: "default" | "error";
}>;

export function StatusPage({
  code,
  title,
  messages,
  background,
}: StatusPageProps) {
  const isErrorBg = background === "error";

  return (
    <main
      className={cn(
        "flex min-h-dvh w-full flex-col items-center justify-center px-4 py-8 text-center text-white",
        notoSansJp.className,
        !isErrorBg && DEFAULT_BG_CLASS
      )}
      style={isErrorBg ? ERROR_BG_STYLE : undefined}
    >
      <div className="flex w-full max-w-[42rem] flex-col items-center">
        <p
          className={cn(
            "whitespace-nowrap font-black leading-none tracking-[0.2em]",
            "text-[64px] sm:text-[96px] lg:text-[128px]"
          )}
        >
          {code}
        </p>
        <p
          className={cn(
            "mt-2 whitespace-nowrap font-black leading-none tracking-[0.2em]",
            "text-[40px] sm:text-[64px] lg:text-[96px]"
          )}
        >
          {title}
        </p>
        <div className="mt-8 space-y-2 sm:mt-10">
          {messages.map((line) => (
            <p
              key={line}
              className="text-[16px] font-bold tracking-[0.2em] sm:text-[20px] lg:text-[24px]"
            >
              {line}
            </p>
          ))}
        </div>
        <Button
          asChild
          className="mt-8 h-[60px] w-full max-w-[280px] rounded-[10px] bg-black text-[20px] font-bold tracking-[0.2em] text-white hover:bg-[#181818] sm:mt-10 sm:text-[24px]"
        >
          <Link href={ROUTES.home}>Topへ戻る</Link>
        </Button>
      </div>
    </main>
  );
}
