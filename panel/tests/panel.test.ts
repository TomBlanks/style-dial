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
  panel = mountPanel(store, { ui: { expanded: true, tab: "controls", active: "A" }, onUiChange: () => {} });
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

describe("footer: undo, redo, reset all", () => {
  const btn = (label: string) => $<HTMLButtonElement>(`[aria-label="${label}"]`);

  it("undo/redo buttons follow history", () => {
    expect(btn("Undo").disabled).toBe(true);
    expect(btn("Redo").disabled).toBe(true);
    const slider = $$<HTMLInputElement>('input[type="range"]')[1];
    slider.value = "4";
    slider.dispatchEvent(new Event("input"));
    slider.value = "4.5";
    slider.dispatchEvent(new Event("input"));
    slider.dispatchEvent(new Event("change")); // pointer release
    expect(btn("Undo").disabled).toBe(false);
    btn("Undo").click();
    expect(store.shownValues()["--text-h1"]).toBe(3.5);
    expect(btn("Redo").disabled).toBe(false);
    btn("Redo").click();
    expect(store.shownValues()["--text-h1"]).toBe(4.5);
  });
  it("Cmd/Ctrl+Z works when focus is in the panel but not inside a text field", () => {
    store.apply({ "--text-h1": 4 });
    const slider = $$<HTMLInputElement>('input[type="range"]')[0];
    slider.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyZ", metaKey: true, bubbles: true, composed: true }));
    expect(store.shownValues()["--text-h1"]).toBe(3.5);
    slider.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyZ", ctrlKey: true, shiftKey: true, bubbles: true, composed: true }));
    expect(store.shownValues()["--text-h1"]).toBe(4);
    const hex = $<HTMLInputElement>(".hex");
    hex.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyZ", metaKey: true, bubbles: true, composed: true }));
    expect(store.shownValues()["--text-h1"]).toBe(4);
  });
  it("shortcuts outside the panel do nothing", () => {
    store.apply({ "--text-h1": 4 });
    document.body.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyZ", metaKey: true, bubbles: true }));
    expect(store.shownValues()["--text-h1"]).toBe(4);
  });
  it("Reset all asks first; Cancel keeps changes, Reset clears them as one undoable step", () => {
    expect(btn("Reset all").disabled).toBe(true);
    store.apply({ "--text-h1": 4, "--color-accent": "#000000" });
    btn("Reset all").click();
    expect($("footer .confirm-row").hidden).toBe(false);
    expect($("footer .confirm-text").textContent).toBe("Reset this version to the original?");
    $$<HTMLButtonElement>("footer .confirm-row .btn")[0].click(); // Cancel
    expect(store.changes()).toHaveLength(2);
    expect($("footer .confirm-row").hidden).toBe(true);
    btn("Reset all").click();
    $$<HTMLButtonElement>("footer .confirm-row .btn")[1].click(); // Reset
    expect(store.changes()).toHaveLength(0);
    btn("Undo").click();
    expect(store.changes()).toHaveLength(2);
  });
  it("Escape cancels the reset confirmation", () => {
    store.apply({ "--text-h1": 4 });
    btn("Reset all").click();
    $("footer .confirm-row").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect($("footer .confirm-row").hidden).toBe(true);
    expect(store.changes()).toHaveLength(1);
  });
  it("per-token reset is one undoable entry", () => {
    store.apply({ "--text-h1": 5 });
    $$(".ctl")[1].querySelector<HTMLButtonElement>(".reset")!.click();
    expect(store.shownValues()["--text-h1"]).toBe(3.5);
    btn("Undo").click();
    expect(store.shownValues()["--text-h1"]).toBe(5);
  });
});

describe("versions bar", () => {
  const vtabs = () => $$<HTMLButtonElement>('.versions [role="tab"]');
  const add = () => $<HTMLButtonElement>('[aria-label="Try a new version"]');
  const alt = (digit: number) =>
    $(".win").dispatchEvent(new KeyboardEvent("keydown", { code: `Digit${digit}`, altKey: true, shiftKey: true, bubbles: true }));

  it("+ creates B then C, switching to each, and hides at three", () => {
    add().click();
    expect(vtabs().map((t) => t.textContent)).toEqual(["Original", "A", "B"]);
    expect($('.versions [aria-selected="true"]').textContent).toBe("B");
    add().click();
    expect(vtabs()).toHaveLength(4);
    expect(add().hidden).toBe(true);
  });
  it("no ✕ while there's only one version; ✕ only on the selected tab otherwise", () => {
    expect($$(".vtab-x").filter((x) => !x.hidden)).toHaveLength(0);
    add().click();
    const visible = $$(".vtab-x").filter((x) => !x.hidden);
    expect(visible.map((x) => x.getAttribute("aria-label"))).toEqual(["Delete Version B"]);
  });
  it("delete asks first, showing the change count; Cancel keeps it; Delete removes it", () => {
    add().click();
    store.apply({ "--text-h1": 5, "--color-accent": "#000000" });
    $<HTMLButtonElement>('[aria-label="Delete Version B"]').click();
    const confirm = $(".top.confirm-row");
    expect(confirm.hidden).toBe(false);
    expect(confirm.textContent).toContain("Delete Version B? Its 2 changes will be lost.");
    confirm.querySelector<HTMLButtonElement>(".btn:not(.danger)")!.click();
    expect(store.versionIds()).toEqual(["A", "B"]);
    $<HTMLButtonElement>('[aria-label="Delete Version B"]').click();
    $<HTMLButtonElement>(".btn.danger").click();
    expect(store.versionIds()).toEqual(["A"]);
    expect($(".top.confirm-row").hidden).toBe(true);
  });
  it("Delete key on the selected tab asks to delete; Escape cancels", () => {
    add().click();
    const b = vtabs()[2];
    b.focus();
    b.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true }));
    expect($(".top.confirm-row").textContent).toContain("It has no changes.");
    $(".top.confirm-row").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect($(".top.confirm-row").hidden).toBe(true);
    expect(store.versionIds()).toEqual(["A", "B"]);
  });
  it("Alt+Shift+1 = Original, 2 = A, 3 = B, 4 = C; missing versions and 0 are ignored", () => {
    add().click();
    alt(1);
    expect(store.getState().active).toBe("original");
    alt(2);
    expect(store.getState().active).toBe("A");
    alt(4);
    expect(store.getState().active).toBe("A"); // no C yet
    alt(0);
    expect(store.getState().active).toBe("A");
    alt(3);
    expect(store.getState().active).toBe("B");
  });
  it("controls, dots, badge and copy label follow the active version", () => {
    store.apply({ "--text-h1": 5 });
    add().click();
    store.apply({ "--color-accent": "#000000" });
    expect($(".copy").textContent).toBe("Copy 2 changes");
    store.view("A");
    expect($(".copy").textContent).toBe("Copy 1 change");
    expect($$<HTMLInputElement>(".num input")[1].value).toBe("5");
    expect($$(".dot").filter((d) => !d.hidden)).toHaveLength(2);
  });
});

describe("Checks tab", () => {
  const checksTab = () => $$<HTMLButtonElement>('.tabs [role="tab"]')[1];
  const open = () => checksTab().click();

  it("shows 'No issues found.' for a clean design, and no badge", () => {
    open();
    expect($('[role="tabpanel"]:not([hidden]) .empty').textContent).toBe("No issues found.");
    expect(checksTab().querySelector<HTMLElement>(".count")!.hidden).toBe(true);
  });
  it("re-runs 100ms after a change; the badge counts warnings only", () => {
    vi.useFakeTimers();
    store.apply({ "--color-fg": "#bbbbbb", "--measure": 40 }); // C1 warning + C7 info
    expect($$(".check")).toHaveLength(0);
    vi.advanceTimersByTime(100);
    expect($$(".check").map((c) => c.dataset.id)).toEqual(["C1", "C7"]);
    expect(checksTab().querySelector(".count")!.textContent).toBe("1");
    vi.useRealTimers();
  });
  it("Fix applies as one undoable step", () => {
    vi.useFakeTimers();
    store.apply({ "--measure": 90 });
    vi.advanceTimersByTime(100);
    open();
    $<HTMLButtonElement>('.check[data-id="C6"] .btn').click();
    expect(store.shownValues()["--measure"]).toBe(68);
    vi.advanceTimersByTime(100);
    expect($$(".check")).toHaveLength(0);
    $<HTMLButtonElement>('[aria-label="Undo"]').click();
    expect(store.shownValues()["--measure"]).toBe(90);
    vi.useRealTimers();
  });
  it("Original view shows the original design's results without Fix buttons", () => {
    vi.useFakeTimers();
    const s = new Store(validSample((c) => { c.tokens[4].default = 90; })); // original measure is too long
    panel!.destroy();
    panel = mountPanel(s, { ui: { expanded: true, tab: "checks", active: "A" }, onUiChange: () => {} });
    s.view("original");
    vi.advanceTimersByTime(100);
    expect($$(".check").map((c) => c.dataset.id)).toEqual(["C6"]);
    expect($$(".check .btn")).toHaveLength(0);
    vi.useRealTimers();
  });
});

describe("Suggestions tab", () => {
  // Sample suggestions: "bigger-hero" (--text-h1 4, --space-section 112) and "warmer" (--color-accent #b4380a)
  const open = () => $$<HTMLButtonElement>('.tabs [role="tab"]')[2].click();
  const cardEl = (id: string) => $(`.sug[data-id="${id}"]`);
  const button = (id: string, text: string) =>
    [...cardEl(id).querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent === text)!;

  it("lists cards with title, reason and the tokens they change", () => {
    open();
    expect($$(".sug h3").map((h) => h.textContent)).toEqual(["Let the hero breathe", "Warmer accent"]);
    expect([...cardEl("bigger-hero").querySelectorAll(".chip")].map((c) => c.textContent)).toEqual(["Heading 1", "Section spacing"]);
  });
  it("Preview shows it on the page without touching history; Cancel ends it", () => {
    open();
    button("bigger-hero", "Preview").click();
    expect(store.pageValues()["--text-h1"]).toBe(4);
    expect(store.canUndo()).toBe(false);
    expect(cardEl("bigger-hero").classList.contains("previewing")).toBe(true);
    expect([...cardEl("bigger-hero").querySelectorAll("button")].map((b) => b.textContent)).toEqual(["Cancel", "Apply"]);
    button("bigger-hero", "Cancel").click();
    expect(store.pageValues()["--text-h1"]).toBe(3.5);
  });
  it("only one preview at a time", () => {
    open();
    button("bigger-hero", "Preview").click();
    button("warmer", "Preview").click();
    expect(store.pageValues()["--text-h1"]).toBe(3.5);
    expect(store.pageValues()["--color-accent"]).toBe("#b4380a");
    expect($$(".sug.previewing")).toHaveLength(1);
  });
  it("Apply is one history entry and shows ✓ Applied; clicking it un-applies to the values before", () => {
    store.apply({ "--text-h1": 5 });
    open();
    button("bigger-hero", "Preview").click();
    button("bigger-hero", "Apply").click();
    expect(store.shownValues()["--text-h1"]).toBe(4);
    expect(store.getState().preview).toBeNull();
    expect(cardEl("bigger-hero").querySelector(".applied-tag")!.textContent).toBe("Applied");
    store.undo();
    expect(store.shownValues()["--text-h1"]).toBe(5); // one entry
    store.redo();
    cardEl("bigger-hero").querySelector<HTMLButtonElement>(".applied-tag")!.click();
    expect(store.shownValues()["--text-h1"]).toBe(5);
    expect(store.shownValues()["--space-section"]).toBe(96);
    expect(button("bigger-hero", "Preview")).toBeTruthy();
  });
  it("shows Applied when the values already match (e.g. after a reload)", () => {
    store.apply({ "--color-accent": "#b4380a" });
    open();
    expect(cardEl("warmer").classList.contains("applied")).toBe(true);
    cardEl("warmer").querySelector<HTMLButtonElement>(".applied-tag")!.click(); // unknown prior → original values
    expect(store.shownValues()["--color-accent"]).toBe("#c2410c");
  });
  it("Copy changes removes applied cards from that version only; they return if un-applied", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    open();
    button("warmer", "Preview").click();
    button("warmer", "Apply").click();
    store.createVersion(); // B is a copy of A, so "warmer" is applied there too
    store.view("A");
    $<HTMLButtonElement>(".copy").click();
    await Promise.resolve(); await Promise.resolve();
    expect($$(".sug").map((c) => c.dataset.id)).toEqual(["bigger-hero"]);
    store.view("B");
    expect($$(".sug").map((c) => c.dataset.id)).toEqual(["bigger-hero", "warmer"]);
    store.view("A");
    store.undo(); // un-apply in A → the card comes back
    expect($$(".sug").map((c) => c.dataset.id)).toEqual(["bigger-hero", "warmer"]);
    vi.unstubAllGlobals();
  });
  it("leaving the tab or pressing Escape ends a preview", () => {
    open();
    button("bigger-hero", "Preview").click();
    $$<HTMLButtonElement>('.tabs [role="tab"]')[0].click();
    expect(store.getState().preview).toBeNull();
    open();
    button("bigger-hero", "Preview").click();
    $(".win").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(store.getState().preview).toBeNull();
  });
  it("Original view shows a note instead of cards", () => {
    open();
    store.view("original");
    expect($$(".sug")).toHaveLength(0);
    expect($('[role="tabpanel"]:not([hidden]) .empty').textContent).toMatch(/Pick a version to preview them/);
  });
});

describe("suggestions you've already gone past (user decision: hidden)", () => {
  // "bigger-hero" suggests --text-h1 4 (from 3.5) and --space-section 112 (from 96)
  const open = () => $$<HTMLButtonElement>('.tabs [role="tab"]')[2].click();
  const ids = () => $$(".sug").map((c) => c.dataset.id);

  it("hides a size suggestion once every change has been passed in the same direction", () => {
    open();
    store.apply({ "--text-h1": 5 });
    expect(ids()).toContain("bigger-hero"); // section spacing not passed yet
    store.apply({ "--space-section": 140 });
    expect(ids()).not.toContain("bigger-hero");
    store.undo();
    expect(ids()).toContain("bigger-hero"); // comes back
  });
  it("going the other way doesn't hide it", () => {
    open();
    store.apply({ "--text-h1": 3, "--space-section": 80 });
    expect(ids()).toContain("bigger-hero");
  });
  it("colour suggestions only count when the colour matches exactly", () => {
    open();
    store.apply({ "--color-accent": "#8f2a06" }); // darker than the suggestion, but not equal
    expect(ids()).toContain("warmer");
  });
});
