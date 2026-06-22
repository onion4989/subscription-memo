import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const STEP_COLUMN_WIDTH_CLASS = "w-[180px] shrink-0";

type GuideStepHeaderProps = {
  step: number;
  title: string;
  className?: string;
};

export function GuideStepHeader({ step, title, className }: GuideStepHeaderProps) {
  return (
    <h2
      className={cn(
        "flex items-center gap-1 text-left font-semibold text-white",
        STEP_COLUMN_WIDTH_CLASS,
        className
      )}
    >
      <span className="text-[36px] leading-none">{step}</span>
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
        "flex flex-col gap-2.5 rounded-xl p-2.5 shadow-sm",
        STEP_COLUMN_WIDTH_CLASS,
        className
      )}
      style={{ backgroundColor }}
    >
      <p className="text-center text-sm leading-relaxed text-white">
        {description}
      </p>
      <div
        className={cn(
          "flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-[10px] bg-white p-2.5",
          !image && "bg-slate-300"
        )}
        aria-hidden={image ? undefined : true}
      >
        {image}
      </div>
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
