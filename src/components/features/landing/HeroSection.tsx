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

const HERO_IMAGE_CLASS_NAME =
  "h-auto w-full max-w-full rounded-[5px] object-contain sm:max-w-[520px]";

function HeroIllustration() {
  return (
    <Image
      src="/assets/pages/top/img_top_hero.png"
      alt="サブスク帳イメージ"
      width={520}
      height={390}
      sizes="(min-width: 1024px) 520px, (min-width: 640px) 90vw, 100vw"
      priority
      className={HERO_IMAGE_CLASS_NAME}
    />
  );
}

export function HeroSection() {
  return (
    <main className="min-h-screen w-full bg-linear-to-b from-[#000000] to-[#06648F] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-12 lg:items-center lg:gap-8">
        <section className="flex flex-col gap-5 lg:col-span-4">
          <header>
            <div className="space-y-1">
              <p
                className={`text-[36px] leading-none text-white sm:text-[48px] md:text-[64px] ${notoSansJp.className}`}
              >
                サブスク
              </p>
              <h1
                className={`text-[64px] leading-none tracking-normal text-white sm:text-[96px] lg:text-[128px] lg:tracking-wide ${allertaStencil.className}`}
              >
                MEMO
              </h1>
            </div>
          </header>

          <div className="flex items-center justify-center lg:hidden">
            <HeroIllustration />
          </div>

          <hr className="w-full border-white/70" />

          <p className="text-base text-white sm:text-[20px]">
            サブスクを忘れないメモ帳
          </p>

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
            className="mt-2 h-[36px] w-full rounded-[5px] bg-black text-white hover:bg-[#181818] lg:w-[200px]"
          >
            <Link href={ROUTES.login}>ログイン</Link>
          </Button>
        </section>

        <section className="hidden items-center justify-center lg:col-span-8 lg:flex">
          <HeroIllustration />
        </section>
      </div>
    </main>
  );
}
