"use client";

import { StatusPage } from "@/components/features/error/StatusPage";

export default function ErrorPage() {
  return (
    <StatusPage
      code="500"
      title="Error"
      messages={[
        "何かしらの問題が発生しました。",
        "下記ボタンからお戻りください。",
      ]}
      background="error"
    />
  );
}
