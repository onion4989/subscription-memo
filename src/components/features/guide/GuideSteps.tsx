import { Fragment } from "react";
import Image from "next/image";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { GUIDE_IMAGE_VERSION, GUIDE_STEPS } from "@/components/features/guide/constants";
import {
  GuideStepCardContent,
  GuideStepHeader,
  STEP_COLUMN_WIDTH_CLASS,
} from "@/components/features/guide/GuideStepCardWrapper";
import { cn } from "@/lib/utils";

const GUIDE_ARROW_CLASS = "shrink-0 text-2xl text-white/90";

function GuideArrowDown() {
  return <FaChevronDown className={GUIDE_ARROW_CLASS} aria-hidden="true" />;
}

function GuideArrowRight() {
  return <FaChevronRight className={GUIDE_ARROW_CLASS} aria-hidden="true" />;
}

export function GuideSteps() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="mx-auto flex w-full flex-col items-center gap-10 lg:w-max">
        <h1 className="w-full text-center text-2xl font-bold text-white lg:text-[36px]">
          サブスクMEMOの使い方
        </h1>
        <div className="flex w-full flex-col gap-3 lg:w-max lg:min-w-full lg:flex-row lg:items-start lg:justify-center">
          {GUIDE_STEPS.map((guideStep, index) => (
            <Fragment key={guideStep.step}>
              <div className={cn("flex flex-col gap-3", STEP_COLUMN_WIDTH_CLASS)}>
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
                      className="h-full w-full object-contain"
                    />
                  }
                />
              </div>
              {index < GUIDE_STEPS.length - 1 ? (
                <>
                  <div className="flex items-center justify-center py-1 lg:hidden">
                    <GuideArrowDown />
                  </div>
                  <div className="hidden w-6 shrink-0 flex-col gap-3 self-stretch lg:flex">
                    <div className="invisible overflow-hidden" aria-hidden="true">
                      <GuideStepHeader
                        step={guideStep.step}
                        title={guideStep.title}
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <GuideArrowRight />
                    </div>
                  </div>
                </>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
