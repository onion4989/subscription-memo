import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * jsdom は matchMedia を実装しないため、非マッチ（モバイル相当）を既定値として補う。
 * マッチ状態を切り替えて検証したいテストは、各ファイルで上書きする。
 */
function createMediaQueryList(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: createMediaQueryList,
});

afterEach(() => {
  cleanup();
});
