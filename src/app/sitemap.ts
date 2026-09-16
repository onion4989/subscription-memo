import type { MetadataRoute } from "next";

import { ROUTES } from "@/lib/routes";
import { shouldBlockSearchIndexing } from "@/lib/search-indexing";

/**
 * 収録するのはトップページだけ。ログイン・登録画面を検索結果に出さないため
 * （方針は `.cursor/rules/project-context.mdc`）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (shouldBlockSearchIndexing()) {
    return [];
  }

  const baseUrl = process.env.AUTH_URL;
  if (!baseUrl) {
    return [];
  }

  return [
    {
      url: new URL(ROUTES.home, baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
