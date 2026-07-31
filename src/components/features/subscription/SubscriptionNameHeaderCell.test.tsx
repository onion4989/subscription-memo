import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionNameHeaderCell } from "@/components/features/subscription/SubscriptionNameHeaderCell";
import { SUBSCRIPTION_TABLE_FRAME_DATA_ATTR } from "@/components/features/subscription/SubscriptionTableSection";
import type { UpcomingRenewalUrgencyTier } from "@/lib/subscription/renewal-upcoming-notice";

type ObserverInstance = {
  callback: IntersectionObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

const observerInstances: ObserverInstance[] = [];

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function mockIntersectionObserver() {
  observerInstances.length = 0;

  class MockIntersectionObserver {
    readonly callback: IntersectionObserverCallback;
    readonly observe = vi.fn();
    readonly unobserve = vi.fn();
    readonly disconnect = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      observerInstances.push({
        callback,
        observe: this.observe,
        disconnect: this.disconnect,
      });
    }
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
}

function emitIntersection(ratio: number, isIntersecting = ratio > 0) {
  const instance = observerInstances.at(-1);
  expect(instance).toBeDefined();

  const entry = {
    isIntersecting,
    intersectionRatio: ratio,
    target: document.createElement("span"),
    time: 0,
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
  } satisfies Partial<IntersectionObserverEntry> as IntersectionObserverEntry;

  act(() => {
    instance!.callback([entry], instance as unknown as IntersectionObserver);
  });
}

function withFrame(ui: ReactNode) {
  return <div {...{ [SUBSCRIPTION_TABLE_FRAME_DATA_ATTR]: "" }}>{ui}</div>;
}

function renderInFrame(ui: ReactNode) {
  return render(withFrame(ui));
}

function nameHeaderTable(urgencyTier: UpcomingRenewalUrgencyTier | null) {
  return (
    <table>
      <thead>
        <tr>
          <SubscriptionNameHeaderCell name="Netflix" urgencyTier={urgencyTier} />
        </tr>
      </thead>
    </table>
  );
}

function mockResizeObserver() {
  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  vi.stubGlobal("ResizeObserver", MockResizeObserver);
}

describe("SubscriptionNameHeaderCell", () => {
  beforeEach(() => {
    mockMatchMedia(true);
    mockIntersectionObserver();
    mockResizeObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("urgency なしのときは更新間近を出さない", () => {
    renderInFrame(
      <table>
        <thead>
          <tr>
            <SubscriptionNameHeaderCell name="Netflix" urgencyTier={null} />
          </tr>
        </thead>
      </table>
    );

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.queryByText("更新間近")).not.toBeInTheDocument();
    expect(observerInstances).toHaveLength(0);
  });

  it("md 未満では更新間近を出さない", () => {
    mockMatchMedia(false);

    renderInFrame(
      <table>
        <thead>
          <tr>
            <SubscriptionNameHeaderCell name="Netflix" urgencyTier={5} />
          </tr>
        </thead>
      </table>
    );

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.queryByText("更新間近")).not.toBeInTheDocument();
    expect(observerInstances).toHaveLength(0);
  });

  it("枠内で十分見えているとき更新間近を表示する", () => {
    renderInFrame(
      <table>
        <thead>
          <tr>
            <SubscriptionNameHeaderCell name="Netflix" urgencyTier={5} />
          </tr>
        </thead>
      </table>
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(observerInstances).toHaveLength(1);

    emitIntersection(1);
    expect(screen.getByRole("tooltip")).toHaveTextContent("更新間近");
  });

  it("枠外（交差が不十分）のとき更新間近を隠す", () => {
    renderInFrame(
      <table>
        <thead>
          <tr>
            <SubscriptionNameHeaderCell name="Netflix" urgencyTier={3} />
          </tr>
        </thead>
      </table>
    );

    emitIntersection(1);
    expect(screen.getByRole("tooltip")).toHaveTextContent("更新間近");

    emitIntersection(0.2, true);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    emitIntersection(0, false);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("トリガーが外れると観測を解除し、再表示時に前回の表示状態を持ち越さない", () => {
    const { rerender } = renderInFrame(nameHeaderTable(5));

    emitIntersection(1);
    expect(screen.getByRole("tooltip")).toHaveTextContent("更新間近");

    rerender(withFrame(nameHeaderTable(null)));
    expect(observerInstances.at(-1)?.disconnect).toHaveBeenCalled();

    rerender(withFrame(nameHeaderTable(5)));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    emitIntersection(1);
    expect(screen.getByRole("tooltip")).toHaveTextContent("更新間近");
  });
});
