import type { Metadata } from "next";
import { StatusPage } from "@/components/features/error/StatusPage";

export const metadata: Metadata = {
  title: "404 Not Found",
};

export default function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Not Found"
      messages={[
        "お探しのページは見つかりませんでした。",
        "下記ボタンからお戻りください。",
      ]}
      background="default"
    />
  );
}
