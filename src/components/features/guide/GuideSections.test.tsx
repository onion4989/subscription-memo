import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  GUIDE_HIGHLIGHT_PATTERN,
  GUIDE_SECTIONS,
  stripGuideHighlightMarkers,
} from "@/components/features/guide/constants";
import { GuideSections } from "@/components/features/guide/GuideSections";

/** 装飾された語は span に分かれるため、getByText ではなく textContent で照合する */
function findParagraphByText(
  scope: HTMLElement,
  text: string
): HTMLParagraphElement | undefined {
  return Array.from(scope.querySelectorAll("p")).find(
    (paragraph) => paragraph.textContent === text
  );
}

function findSectionFrame(section: HTMLElement): HTMLElement | undefined {
  return Array.from(section.querySelectorAll("div")).find(
    (el) =>
      el.classList.contains("border-2") &&
      el.classList.contains("border-white") &&
      el.className.includes("bg-[var(--app-table-frame)]") &&
      el.classList.contains("p-5")
  );
}

describe("GuideSections", () => {
  it("タイトルは維持し、旧ステップカードは表示しない", () => {
    render(<GuideSections />);

    expect(
      screen.getByRole("heading", { name: "サブスクMEMOの使い方", level: 1 })
    ).toBeInTheDocument();
    expect(screen.queryByText("アカウント登録")).not.toBeInTheDocument();
    expect(screen.queryByText("サブスク一覧で確認")).not.toBeInTheDocument();
  });

  it("各セクションの見出しは枠の外、本文は黒背景・白2px枠の中に置く", () => {
    render(<GuideSections />);

    for (const sectionData of GUIDE_SECTIONS) {
      const heading = screen.getByRole("heading", {
        name: sectionData.title,
        level: 2,
      });
      const section = heading.closest("section");
      expect(section).not.toBeNull();

      const frame = findSectionFrame(section!);
      expect(frame).toBeDefined();
      expect(frame).toHaveClass("w-full", "rounded-[10px]");
      expect(frame!.contains(heading)).toBe(false);

      for (const paragraph of sectionData.body) {
        expect(
          findParagraphByText(frame!, stripGuideHighlightMarkers(paragraph))
        ).toBeDefined();
      }
    }
  });

  it("データの登録方法は番号付き手順を枠内に表示する", () => {
    render(<GuideSections />);

    const section = screen
      .getByRole("heading", { name: "データの登録方法", level: 2 })
      .closest("section");
    const stepTitles = within(section!)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(stepTitles).toEqual(["1登録画面へ", "2追加ボタンを押下", "3データ確認"]);
  });

  it("「※」始まりの行だけ14pxに縮小する", () => {
    const { container } = render(<GuideSections />);

    const notes = GUIDE_SECTIONS.flatMap((section) => [
      ...section.body,
      ...(section.steps?.flatMap((step) => step.body) ?? []),
    ]).filter((paragraph) => paragraph.startsWith("※"));

    expect(notes.length).toBeGreaterThan(0);

    for (const note of notes) {
      expect(
        findParagraphByText(container, stripGuideHighlightMarkers(note))
      ).toHaveClass("text-sm", "leading-[20px]");
    }

    expect(
      findParagraphByText(
        container,
        "パスワードを忘れた場合は、ログイン画面 >「パスワードをお忘れですか？」のリンクから再度設定してください。"
      )
    ).toHaveClass("text-base", "leading-[24px]");
  });

  it("囲み記号で指定した語だけ背景色付きの矩形にする", () => {
    const { container } = render(<GuideSections />);

    const expectedTerms = GUIDE_SECTIONS.flatMap((section) => [
      ...section.body,
      ...(section.steps?.flatMap((step) => step.body) ?? []),
    ]).flatMap((paragraph) =>
      Array.from(paragraph.matchAll(GUIDE_HIGHLIGHT_PATTERN), (match) => match[1])
    );

    expect(expectedTerms.length).toBeGreaterThan(0);

    const highlights = Array.from(container.querySelectorAll("p span"));

    expect(highlights.map((element) => element.textContent)).toEqual(
      expectedTerms
    );

    for (const highlight of highlights) {
      expect(highlight).toHaveClass("whitespace-nowrap", "text-black");
      expect(highlight).toHaveStyle({ backgroundColor: "#C4C4C4" });
    }
  });

  it("手順本文の字下げはデスクトップのみ効かせる", () => {
    const { container } = render(<GuideSections />);

    const stepBodies = Array.from(container.querySelectorAll("ol li > div"));
    expect(stepBodies).toHaveLength(3);

    for (const stepBody of stepBodies) {
      expect(stepBody).toHaveClass("lg:pl-[35px]");
      expect(stepBody).not.toHaveClass("pl-[35px]");
    }
  });

  it("囲み記号は本文に残さない", () => {
    const { container } = render(<GuideSections />);

    expect(container.textContent).not.toContain("[[");
    expect(container.textContent).not.toContain("]]");
  });

  it("説明画像を持つセクションだけ、白枠の中に実寸比で画像を表示する", () => {
    render(<GuideSections />);

    const sectionsWithImage = GUIDE_SECTIONS.filter((section) => section.image);
    expect(screen.getAllByRole("img")).toHaveLength(sectionsWithImage.length);

    for (const section of sectionsWithImage) {
      const image = screen.getByRole("img", { name: section.image!.alt });

      expect(image).toHaveAttribute("width", String(section.image!.width));
      expect(image).toHaveAttribute("height", String(section.image!.height));
      expect(image).toHaveClass("h-auto", "w-full");
      expect(image.getAttribute("src")).toContain(section.image!.src);

      const frame = image.parentElement;
      expect(frame).toHaveClass("bg-white", "rounded-[10px]", "p-4");
    }
  });

  it("データの登録方法は説明画像を持たない", () => {
    render(<GuideSections />);

    const section = screen
      .getByRole("heading", { name: "データの登録方法", level: 2 })
      .closest("section");

    expect(within(section!).queryAllByRole("img")).toHaveLength(0);
  });
});
