import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/state/store";
import { HOST_TAG, mountPanel, type PanelHandle } from "../src/ui/panel";
import { validSample } from "./fixtures-config";

let panel: PanelHandle | null = null;
let store: Store;

const shadow = () => document.querySelector(HOST_TAG)!.shadowRoot!;
const $ = <T extends Element = HTMLElement>(sel: string) => shadow().querySelector(sel) as T;
const $$ = <T extends Element = HTMLElement>(sel: string) => [...shadow().querySelectorAll(sel)] as T[];

function type(input: HTMLInputElement, text: string) {
  input.focus();
  input.value = text;
  input.dispatchEvent(new Event("blur"));
  input.blur();
}

beforeEach(() => {
  store = new Store(validSample());
  panel = mountPanel(store);
});
afterEach(() => {
  panel?.destroy();
  panel = null;
  document.body.innerHTML = "";
});

describe("shell", () => {
  it("mounts one host with an open shadow root and fixed positioning", () => {
    const hosts = document.querySelectorAll(HOST_TAG);
    expect(hosts).toHaveLength(1);
    const host = hosts[0] as HTMLElement;
    expect(host.shadowRoot).not.toBeNull();
    expect(host.style.getPropertyValue("position")).toBe("fixed");
    expect(host.style.getPropertyPriority("position")).toBe("important");
    expect(host.style.getPropertyValue("z-index")).toBe("2147483000");
  });
  it("starts expanded on Version A with the Controls tab selected", () => {
    expect($(".win").hidden).toBe(false);
    expect($(".launcher").hidden).toBe(true);
    const selected = $$('[role="tab"][aria-selected="true"]').map((t) => t.textContent);
    expect(selected).toEqual(["A", "Controls"]);
  });
  it("groups controls in Typography, Spacing, Layout, Colour order, skipping empty groups", () => {
    expect($$(".group > summary").map((s) => s.textContent)).toEqual(["Typography", "Spacing", "Layout", "Colour"]);
    expect($$('input[type="range"]')).toHaveLength(6);
    expect($$('input[type="color"]')).toHaveLength(3);
  });
  it("collapses and expands with the minimise button, launcher and Alt+Shift+T", () => {
    $<HTMLButtonElement>('[aria-label="Minimise Design Tweaker"]').click();
    expect($(".win").hidden).toBe(true);
    expect($(".launcher").hidden).toBe(false);
    $<HTMLButtonElement>(".launcher").click();
    expect($(".win").hidden).toBe(false);
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyT", altKey: true, shiftKey: true }));
    expect($(".win").hidden).toBe(true);
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyT", altKey: true, shiftKey: true }));
    expect($(".win").hidden).toBe(false);
  });
  it("shows the change count on the launcher badge and copy button", () => {
    store.set("--text-h1", 4);
    store.set("--color-accent", "#000000");
    expect($(".badge").hidden).toBe(false);
    expect($(".badge").textContent).toBe("2");
    expect($(".copy").textContent).toBe("Copy 2 changes");
  });
  it("switches tabs with arrow keys (WAI-ARIA tabs)", () => {
    const controls = $$<HTMLButtonElement>('.tabs [role="tab"]')[0];
    controls.focus();
    controls.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect($('.tabs [aria-selected="true"]').textContent).toBe("Checks");
    const panels = $$('[role="tabpanel"]');
    expect(panels.filter((p) => !p.hidden)).toHaveLength(1);
    controls.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
  });
  it("removes everything on destroy", () => {
    panel!.destroy();
    panel = null;
    expect(document.querySelector(HOST_TAG)).toBeNull();
  });
});

describe("size and number controls", () => {
  it("slider input sets the value; rem tokens show a px readout", () => {
    const slider = $$<HTMLInputElement>('input[type="range"]')[1]; // Heading 1
    slider.value = "4";
    slider.dispatchEvent(new Event("input"));
    expect(store.shownValues()["--text-h1"]).toBe(4);
    expect($$(".ctl")[1].querySelector(".sub")!.textContent).toBe("64px");
    expect($$(".ctl")[1].classList.contains("changed")).toBe(true);
  });
  it("typed values clamp on blur; junk reverts", () => {
    const num = $$<HTMLInputElement>(".num input")[0]; // Body text
    type(num, "9");
    expect(store.shownValues()["--text-body"]).toBe(1.375);
    expect(num.value).toBe("1.375");
    type(num, "abc");
    expect(num.value).toBe("1.375");
    expect(store.shownValues()["--text-body"]).toBe(1.375);
  });
  it("the reset button appears only when changed and restores the default", () => {
    const row = $$(".ctl")[1];
    const reset = row.querySelector<HTMLButtonElement>(".reset")!;
    expect(reset.getAttribute("aria-hidden")).toBe("true");
    store.set("--text-h1", 5);
    expect(reset.getAttribute("aria-hidden")).toBe("false");
    expect(reset.getAttribute("aria-label")).toBe("Reset Heading 1 to 3.5rem");
    reset.click();
    expect(store.shownValues()["--text-h1"]).toBe(3.5);
  });
});

describe("colour controls", () => {
  const hexFor = (label: string) =>
    $$(".colour").find((r) => r.querySelector("label")!.textContent === label)!.querySelector<HTMLInputElement>(".hex")!;

  it("accepts hex with or without #, 3 or 6 digits, lowercased", () => {
    type(hexFor("Accent"), "1D4ED8");
    expect(store.shownValues()["--color-accent"]).toBe("#1d4ed8");
    type(hexFor("Accent"), "#abc");
    expect(store.shownValues()["--color-accent"]).toBe("#aabbcc");
  });
  it("rejects invalid hex on blur and reverts to the last valid value", () => {
    type(hexFor("Background"), "not a colour");
    expect(hexFor("Background").value).toBe("#faf8f5");
    expect(store.shownValues()["--color-bg"]).toBe("#faf8f5");
  });
  it("the native picker sets the value live", () => {
    const picker = $$<HTMLInputElement>('input[type="color"]')[2];
    picker.value = "#112233";
    picker.dispatchEvent(new Event("input"));
    expect(store.shownValues()["--color-accent"]).toBe("#112233");
  });
});

describe("Original view", () => {
  it("disables every control, shows defaults, hides change markers and swaps the footer for a note", () => {
    store.set("--text-h1", 5);
    $$<HTMLButtonElement>('.versions [role="tab"]')[0].click();
    expect(store.getState().active).toBe("original");
    expect($$<HTMLInputElement>("input").every((i) => i.disabled)).toBe(true);
    expect($$<HTMLInputElement>(".num input")[1].value).toBe("3.5");
    expect($$(".changed")).toHaveLength(0);
    expect($(".footer-row").hidden).toBe(true);
    expect($(".note").hidden).toBe(false);
    expect($(".dot").hidden).toBe(false); // Version A still has changes
  });
});

describe("fatal config", () => {
  it("shows an error state with the message and no controls", async () => {
    panel!.destroy();
    panel = null;
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    await import("../src/index");
    window.TweakPanel.mount("{ broken");
    const root = document.querySelector(HOST_TAG)!.shadowRoot!;
    expect(root.querySelector('[role="alert"]')!.textContent).toMatch(/not valid JSON/);
    expect(root.querySelectorAll("input")).toHaveLength(0);
    expect(root.querySelector(".badge")!.textContent).toBe("!");
    window.TweakPanel.unmount();
    expect(document.querySelector(HOST_TAG)).toBeNull();
    warn.mockRestore();
  });
});
