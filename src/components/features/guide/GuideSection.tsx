import { Fragment } from "react";
import Image from "next/image";
import { GUIDE_HIGHLIGHT_PATTERN } from "@/components/features/guide/constants";
import { SUBSCRIPTION_SECTION_FRAME_CLASS } from "@/components/features/subscription/SubscriptionTableSection";
import { cn } from "@/lib/utils";
import type {
  GuideSection as GuideSectionData,
  GuideSectionImage,
  GuideSectionStep,
} from "@/components/features/guide/constants";

const GUIDE_STEP_BADGE_BACKGROUND = "#545454";

const GUIDE_HIGHLIGHT_BACKGROUND = "#C4C4C4";

/** 上下の余白は行ボックスの高さに影響しないため、行間 24px のまま矩形を出せる */
const GUIDE_HIGHLIGHT_CLASS =
  "whitespace-nowrap rounded-[4px] px-1.5 py-0.5 text-black";

/**
 * 手順本文はバッジ幅（27px）＋余白（8px）分だけ字下げして見出しと揃える。
 * 横幅が限られるモバイルでは字下げを外して左詰めにする。
 */
const GUIDE_STEP_BODY_INDENT_CLASS = "lg:pl-[35px]";

/** 「※」始まりの行は補足扱いで小さく、直前の本文に寄せて表示する */
const GUIDE_NOTE_PREFIX = "※";

const GUIDE_BODY_TEXT_CLASS =
  "mt-2.5 text-base leading-[24px] text-white first:mt-0";

const GUIDE_NOTE_TEXT_CLASS =
  "mt-1 text-sm leading-[20px] text-white first:mt-0";

/** Figma の画像エリア幅。高さは画像の縦横比に追従させる */
const GUIDE_IMAGE_FRAME_CLASS =
  "w-full shrink-0 rounded-[10px] bg-white p-4 lg:w-[330px]";

function GuideImageFrame({ image }: { image: GuideSectionImage }) {
  return (
    <div className={GUIDE_IMAGE_FRAME_CLASS}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        unoptimized
        className="h-auto w-full"
      />
    </div>
  );
}

/** 囲み記号で分割すると、奇数番目の要素が装飾対象の語になる */
function GuideParagraphText({ text }: { text: string }) {
  return (
    <>
      {text.split(GUIDE_HIGHLIGHT_PATTERN).map((segment, index) =>
        index % 2 === 1 ? (
          <span
            key={index}
            className={GUIDE_HIGHLIGHT_CLASS}
            style={{ backgroundColor: GUIDE_HIGHLIGHT_BACKGROUND }}
          >
            {segment}
          </span>
        ) : (
          <Fragment key={index}>{segment}</Fragment>
        )
      )}
    </>
  );
}

function GuideParagraphs({ body }: { body: readonly string[] }) {
  return (
    <>
      {body.map((paragraph, index) => (
        <p
          key={index}
          className={
            paragraph.startsWith(GUIDE_NOTE_PREFIX)
              ? GUIDE_NOTE_TEXT_CLASS
              : GUIDE_BODY_TEXT_CLASS
          }
        >
          <GuideParagraphText text={paragraph} />
        </p>
      ))}
    </>
  );
}

function GuideStepItem({ step }: { step: GuideSectionStep }) {
  return (
    <li className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-base font-bold text-white">
        <span
          className="flex size-[27px] shrink-0 items-center justify-center rounded-full text-base font-bold leading-none text-white"
          style={{ backgroundColor: GUIDE_STEP_BADGE_BACKGROUND }}
        >
          {step.step}
        </span>
        {step.title}
      </h3>
      <div className={cn("flex flex-col", GUIDE_STEP_BODY_INDENT_CLASS)}>
        <GuideParagraphs body={step.body} />
      </div>
    </li>
  );
}

export function GuideSection({ section }: { section: GuideSectionData }) {
  const headingId = `guide-section-${section.id}`;

  return (
    <section className="w-full min-w-0" aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-2.5 text-xl font-bold text-white">
        {section.title}
      </h2>
      <div className={SUBSCRIPTION_SECTION_FRAME_CLASS}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col">
            <GuideParagraphs body={section.body} />
          </div>
          {section.image ? <GuideImageFrame image={section.image} /> : null}
        </div>
        {section.steps ? (
          <ol className="mt-6 flex flex-col gap-6">
            {section.steps.map((step) => (
              <GuideStepItem key={step.step} step={step} />
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
