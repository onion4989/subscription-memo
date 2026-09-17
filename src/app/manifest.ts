import type { MetadataRoute } from "next";

/**
 * ホーム画面に追加したときの表示定義。
 * `start_url` を相対にするのは `metadataBase` が `AUTH_URL` 依存で、未設定のビルドでも壊さないため。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "サブスクMEMO",
    short_name: "SubscMemo",
    description:
      "サブスクリプションの契約情報を一元管理し、次回更新日の前にメールでお知らせして解約忘れを防ぐサービスです。",
    lang: "ja",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/assets/common/ic_c_app_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/common/ic_c_app-maskable_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
