import { GUIDE_SECTIONS } from "@/components/features/guide/constants";
import { GuideSection } from "@/components/features/guide/GuideSection";

export function GuideSections() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-10">
      <h1 className="w-full text-center text-2xl font-bold text-[color:var(--app-fg)] lg:text-[36px]">
        サブスクMEMOの使い方
      </h1>
      <div className="flex w-full min-w-0 flex-col gap-8">
        {GUIDE_SECTIONS.map((section) => (
          <GuideSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
