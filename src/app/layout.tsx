import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/components/providers/AppProviders";
import { shouldBlockSearchIndexing } from "@/lib/search-indexing";

const inter = Inter({ subsets: ["latin"] });

const blockSearchIndexing = shouldBlockSearchIndexing();

const SITE_NAME = "サブスクMEMO";
const SITE_DESCRIPTION =
  "サブスクリプションの契約情報を一元管理し、次回更新日の前にメールでお知らせして解約忘れを防ぐサービスです。";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...(process.env.AUTH_URL
    ? { metadataBase: new URL(process.env.AUTH_URL) }
    : {}),
  title: {
    default: `${SITE_NAME} | サブスクの更新日をメールでお知らせ`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} | サブスクの更新日をメールでお知らせ`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "website",
  },
  ...(blockSearchIndexing
    ? {
        robots: {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },
      }
    : {}),
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
