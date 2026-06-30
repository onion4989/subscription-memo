import type { MetadataRoute } from "next";

import { shouldBlockSearchIndexing } from "@/lib/search-indexing";

export default function robots(): MetadataRoute.Robots {
  if (shouldBlockSearchIndexing()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}
