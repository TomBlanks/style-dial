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
