import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/index";
import { STYLE_ID } from "../src/overrides";
import { HOST_TAG } from "../src/ui/panel";
import { sampleConfig } from "./fixtures";

afterEach(() => {
  window.TweakPanel.unmount();
  vi.restoreAllMocks();
});

describe("window.TweakPanel", () => {
  it("mount twice is a no-op with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.TweakPanel.mount(sampleConfig());
    window.TweakPanel.mount(sampleConfig());
    expect(document.querySelectorAll(HOST_TAG)).toHaveLength(1);
    expect(warn.mock.calls.some(([m]) => String(m).includes("mount() called twice"))).toBe(true);
  });
  it("logs non-fatal config warnings with a prefix", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = sampleConfig();
    c.tokens[0].default = 99;
    window.TweakPanel.mount(c);
    expect(warn.mock.calls.some(([m]) => String(m).startsWith("[design-tweaker] Token --text-body: default 99"))).toBe(true);
  });
  it("unmount removes the panel and the override style element", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    window.TweakPanel.mount(sampleConfig());
    const slider = document.querySelector(HOST_TAG)!.shadowRoot!.querySelector<HTMLInputElement>('input[type="range"]')!;
    slider.value = "1.25";
    slider.dispatchEvent(new Event("input"));
    return new Promise<void>((done) => requestAnimationFrame(() => {
      expect(document.getElementById(STYLE_ID)?.textContent).toContain("--text-body: 1.25rem;");
      window.TweakPanel.unmount();
      expect(document.querySelector(HOST_TAG)).toBeNull();
      expect(document.getElementById(STYLE_ID)).toBeNull();
      done();
    }));
  });
});

describe("persistence through mount / unmount (a page reload)", () => {
  it("keeps versions, values, the active version and UI state; reconciles when the config default changes", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.clear();
    const root = () => document.querySelector(HOST_TAG)!.shadowRoot!;
    window.TweakPanel.mount(sampleConfig());
    // Version A: body text 1.25; Version B: body text 1.3125; switch to Checks, then minimise
    const slider = () => root().querySelector<HTMLInputElement>('input[type="range"]')!;
    slider().value = "1.25"; slider().dispatchEvent(new Event("input")); slider().dispatchEvent(new Event("change"));
    root().querySelector<HTMLButtonElement>('[aria-label="Try a new version"]')!.click();
    slider().value = "1.3125"; slider().dispatchEvent(new Event("input")); slider().dispatchEvent(new Event("change"));
    root().querySelectorAll<HTMLButtonElement>('.tabs [role="tab"]')[1].click();
    root().querySelector<HTMLButtonElement>('[aria-label="Minimise Design Tweaker"]')!.click();
    window.TweakPanel.unmount(); // flushes the pending save

    window.TweakPanel.mount(sampleConfig());
    expect(root().querySelector<HTMLElement>(".win")!.hidden).toBe(true);
    expect(root().querySelector('.tabs [aria-selected="true"]')!.textContent).toContain("Checks");
    expect(root().querySelector('.versions [aria-selected="true"]')!.textContent).toBe("B");
    expect(slider().value).toBe("1.3125");
    window.TweakPanel.unmount();

    // Claude applied Version B: the config default is now 1.3125 → B shows 0 changes, A keeps 1.25.
    const applied = sampleConfig();
    applied.tokens[0].default = 1.3125;
    window.TweakPanel.mount(applied);
    expect(root().querySelector(".badge")!.hasAttribute("hidden")).toBe(true);
    root().querySelectorAll<HTMLButtonElement>('.versions [role="tab"]')[1].click(); // A
    expect(slider().value).toBe("1.25");
    expect(root().querySelector(".copy")!.textContent).toBe("Copy 1 change");
  });
});
