import { GuideSteps } from "@/components/features/guide/GuideSteps";

export default function GuidePage() {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-10">
      <h1 className="sr-only">
        サブスクMEMOの使い方
      </h1>
      <GuideSteps />
    </div>
  );
}
