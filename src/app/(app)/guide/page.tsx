import { GuideSteps } from "@/components/features/guide/GuideSteps";

export default function GuidePage() {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-10">
      <h1 className="py-5 text-center text-3xl font-bold text-white md:py-20 md:text-4xl">
        サブスクMEMOの使い方
      </h1>
      <GuideSteps />
    </div>
  );
}
