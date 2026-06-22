import { Fragment } from "react";
import Image from "next/image";
import { FaChevronRight } from "react-icons/fa6";
import { GUIDE_IMAGE_VERSION, GUIDE_STEPS } from "@/components/features/guide/constants";
import {
  GuideStepCardContent,
  GuideStepHeader,
} from "@/components/features/guide/GuideStepCardWrapper";
import { APP_SCROLLBAR_X_CLASS } from "@/lib/ui-classes";

function GuideArrow() {
  return (
    <FaChevronRight
      className="shrink-0 text-2xl text-white/90"
      aria-hidden="true"
    />
  );
}

export function GuideSteps() {
  return (
    <div className={APP_SCROLLBAR_X_CLASS}>
      <div className="flex w-max min-w-full items-start gap-3">
      {GUIDE_STEPS.map((guideStep, index) => (
        <Fragment key={guideStep.step}>
          <div className="flex w-[180px] shrink-0 flex-col gap-3">
            <GuideStepHeader step={guideStep.step} title={guideStep.title} />
            <GuideStepCardContent
              description={guideStep.description}
              backgroundColor={guideStep.cardBackgroundColor}
              image={
                <Image
                  src={`${guideStep.imageSrc}?v=${GUIDE_IMAGE_VERSION}`}
                  alt={guideStep.imageAlt}
                  width={guideStep.imageWidth}
                  height={guideStep.imageHeight}
                  unoptimized
                  className="max-h-full max-w-full object-contain"
                />
              }
            />
          </div>
          {index < GUIDE_STEPS.length - 1 ? (
            <div className="flex w-6 shrink-0 flex-col gap-3 self-stretch">
              <div className="invisible overflow-hidden" aria-hidden="true">
                <GuideStepHeader step={guideStep.step} title={guideStep.title} />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <GuideArrow />
              </div>
            </div>
          ) : null}
        </Fragment>
      ))}
      </div>
    </div>
  );
}
