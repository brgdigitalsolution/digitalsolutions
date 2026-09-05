import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom doesn't implement these — the app uses them for reduced-motion checks,
// scroll-reveal animations, and "scroll to top" on navigation.
window.matchMedia = window.matchMedia || function () {
  return { matches: false, addListener: () => {}, removeListener: () => {} };
};
window.IntersectionObserver = window.IntersectionObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.scrollTo = () => {};

beforeEach(() => {
  // Default mock so components that call fetch() on mount/interaction don't hit
  // the network in tests. Individual tests override this via vi.spyOn(...) when
  // they need to assert on the request or simulate a specific response.
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ok: true, reply: "Mocked reply" }) })
  ));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.pushState({}, "", "/");
});
