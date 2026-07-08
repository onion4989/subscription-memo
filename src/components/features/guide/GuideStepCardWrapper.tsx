import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const STEP_COLUMN_WIDTH_CLASS = "w-full shrink-0 lg:w-[200px]";

const GUIDE_STEP_BADGE_BACKGROUND = "#545454";

type GuideStepHeaderProps = {
  step: number;
  title: string;
  className?: string;
};

export function GuideStepHeader({ step, title, className }: GuideStepHeaderProps) {
  return (
    <h2
      className={cn(
        "flex w-full items-center gap-1 text-left font-semibold text-white lg:w-[200px]",
        className
      )}
    >
      <span
        className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-[20px] font-bold leading-none text-white"
        style={{ backgroundColor: GUIDE_STEP_BADGE_BACKGROUND }}
      >
        {step}
      </span>
      <span className="text-[16px] leading-tight">{title}</span>
    </h2>
  );
}

type GuideStepCardContentProps = {
  description: string;
  backgroundColor: string;
  image?: ReactNode;
  className?: string;
};

export function GuideStepCardContent({
  description,
  backgroundColor,
  image,
  className,
}: GuideStepCardContentProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-2.5 rounded-xl p-2.5 shadow-sm",
        "max-lg:flex-row max-lg:items-center",
        "lg:flex-col",
        STEP_COLUMN_WIDTH_CLASS,
        className
      )}
      style={{ backgroundColor }}
    >
      <div
        className={cn(
          "flex size-[110px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] lg:order-2 lg:aspect-square lg:h-auto lg:w-full",
          !image && "bg-slate-300"
        )}
        aria-hidden={image ? undefined : true}
      >
        {image}
      </div>
      <p className="min-w-0 flex-1 text-left text-sm leading-relaxed text-white lg:order-1 lg:w-full lg:flex-none">
        {description}
      </p>
    </div>
  );
}

type GuideStepCardWrapperProps = {
  step: number;
  title: string;
  description: string;
  backgroundColor: string;
  image?: ReactNode;
  className?: string;
};

export function GuideStepCardWrapper({
  step,
  title,
  description,
  backgroundColor,
  image,
  className,
}: GuideStepCardWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-3", STEP_COLUMN_WIDTH_CLASS, className)}>
      <GuideStepHeader step={step} title={title} className="w-full" />
      <GuideStepCardContent
        description={description}
        backgroundColor={backgroundColor}
        image={image}
        className="w-full"
      />
    </div>
  );
}
