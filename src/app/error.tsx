"use client";

import { StatusPage } from "@/components/features/error/StatusPage";

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage(_props: ErrorPageProps) {
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
