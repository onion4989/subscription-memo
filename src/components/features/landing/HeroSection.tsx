import Image from "next/image";
import Link from "next/link";
import { Allerta_Stencil, Noto_Sans_JP } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const allertaStencil = Allerta_Stencil({
  subsets: ["latin"],
  weight: "400",
});

const HERO_FEATURES = [
  "サブスクリプションの管理",
  "月額料金の把握と総額",
  "次回請求時前のお知らせ",
] as const;

export function HeroSection() {
  return (
    <main className="min-h-screen w-full bg-linear-to-b from-[#000000] to-[#06648F] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-12 items-center gap-8">
        <section className="col-span-12 space-y-5 lg:col-span-4">
          <div className="space-y-1">
            <p className={`text-[64px] leading-none text-white ${notoSansJp.className}`}>
              サブスク
            </p>
            <h1
              className={`text-[128px] leading-none tracking-wide text-white ${allertaStencil.className}`}
            >
              MEMO
            </h1>
          </div>

          <hr className="w-full border-white/70" />

          <p className="text-[20px] text-white">サブスクを忘れないメモ帳</p>

          <ol className="space-y-2 text-base text-white">
            {HERO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span aria-hidden="true">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ol>

          <Button
            asChild
            className="mt-2 h-[36px] w-[200px] bg-black text-white hover:bg-[#181818]"
          >
            <Link href={ROUTES.login}>ログイン</Link>
          </Button>
        </section>

        <section className="col-span-12 flex items-center justify-center lg:col-span-8">
          <Image
            src="/assets/hero2.png"
            alt="サブスク帳イメージ"
            width={690}
            height={402}
            sizes="(min-width: 1024px) 690px, 100vw"
            quality={90}
            priority
            className="h-auto w-full max-w-[690px] rounded-md object-cover"
          />
        </section>
      </div>
    </main>
  );
}
