import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSaver, load, reconcile, storageKey } from "../src/state/persist";
import { defaultValues } from "../src/state/values";
import { validSample } from "./fixtures-config";

// Config "v1" is what the panel saw last time; "v2" is after Claude (or someone) edited the code.
const v1 = validSample();
const d1 = defaultValues(v1);
const stored = (versions: Record<string, Record<string, unknown>>, ui: unknown = { expanded: false, tab: "checks", active: "B" }) => ({
  baseDefaults: d1,
  versions,
  ui,
});

describe("reconcile (spec §9)", () => {
  it("default unchanged → every version keeps its values", () => {
    const r = reconcile(v1, stored({ A: { ...d1, "--text-h1": 4 }, B: { ...d1, "--text-h1": 5 } }));
    expect(r.versions.A!["--text-h1"]).toBe(4);
    expect(r.versions.B!["--text-h1"]).toBe(5);
    expect(r.ui).toEqual({ expanded: false, tab: "checks", active: "B" });
  });

  it("applied B through Claude while A differs → both keep their values; B now shows 0 changes", () => {
    // B had h1 = 3.75 and accent #b4380a; Claude wrote those into the code.
    const A = { ...d1, "--text-h1": 5 };
    const B = { ...d1, "--text-h1": 3.75, "--color-accent": "#b4380a" };
    const v2 = validSample((c) => { c.tokens[1].default = 3.75; c.tokens[8].default = "#b4380a"; });
    const d2 = defaultValues(v2);
    const r = reconcile(v2, stored({ A, B }));
    expect(r.versions.B).toEqual(d2);                 // B == new defaults → 0 changes
    expect(r.versions.A!["--text-h1"]).toBe(5);       // A keeps its deliberate alternative
    expect(r.versions.A!["--color-accent"]).toBe("#c2410c"); // A keeps the old accent too (a real difference now)
    expect(r.baseDefaults).toEqual(d2);
  });

  it("code changed outside the panel → the source wins in every version", () => {
    const v2 = validSample((c) => { c.tokens[5].default = 120; }); // --space-section 96 → 120
    const r = reconcile(v2, stored({ A: { ...d1, "--space-section": 100 }, B: { ...d1 } }));
    expect(r.versions.A!["--space-section"]).toBe(120);
    expect(r.versions.B!["--space-section"]).toBe(120);
  });

  it("token removed from the config → removed from every version", () => {
    const v2 = validSample((c) => { c.tokens.splice(2, 1); }); // drop --text-h2
    const r = reconcile(v2, stored({ A: { ...d1, "--text-h2": 3 } }));
    expect("--text-h2" in r.versions.A!).toBe(false);
    expect("--text-h2" in r.baseDefaults).toBe(false);
  });

  it("token added to the config → added to every version at its new default", () => {
    const v2 = validSample((c) => {
      c.tokens.push({ var: "--radius", label: "Radius", group: "Layout", role: "radius", type: "size", unit: "px", default: 12, min: 0, max: 32, step: 1 });
    });
    const r = reconcile(v2, stored({ A: { ...d1 }, B: { ...d1, "--text-h1": 5 } }));
    expect(r.versions.A!["--radius"]).toBe(12);
    expect(r.versions.B!["--radius"]).toBe(12);
  });

  it("repairs malformed or out-of-range stored values", () => {
    const r = reconcile(v1, stored({ A: { ...d1, "--text-h1": 99, "--color-fg": "red", "--measure": "wide" } }));
    expect(r.versions.A!["--text-h1"]).toBe(6);
    expect(r.versions.A!["--color-fg"]).toBe("#1c1b1a");
    expect(r.versions.A!["--measure"]).toBe(68);
  });

  it("nothing stored, or garbage → a fresh Version A at the defaults", () => {
    for (const raw of [null, "nope", 42, { versions: [] }]) {
      const r = reconcile(v1, raw);
      expect(r.versions).toEqual({ A: d1 });
      expect(r.ui).toEqual({ expanded: true, tab: "controls", active: "A" });
    }
  });

  it("a stored active version that no longer exists falls back to A, or the first version", () => {
    expect(reconcile(v1, stored({ A: d1 }, { active: "C" })).ui.active).toBe("A");
    expect(reconcile(v1, stored({ B: d1, C: d1 }, { active: "A" })).ui.active).toBe("B");
    expect(reconcile(v1, stored({ A: d1 }, { active: "original" })).ui.active).toBe("original");
  });
});

describe("load / save", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("uses the key design-tweaker:v1:<id> and writes the reconciled result back", () => {
    expect(storageKey(v1)).toBe("design-tweaker:v1:sample-site");
    localStorage.setItem(storageKey(v1), JSON.stringify(stored({ A: { ...d1, "--text-h1": 4 } })));
    const s = load(v1);
    expect(s.versions.A!["--text-h1"]).toBe(4);
    const back = JSON.parse(localStorage.getItem(storageKey(v1))!);
    expect(back.baseDefaults).toEqual(d1);
  });
  it("works when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(load(v1).versions).toEqual({ A: d1 });
  });
  it("the saver debounces 300ms and skips identical writes", () => {
    vi.useFakeTimers();
    const set = vi.spyOn(Storage.prototype, "setItem");
    const saver = createSaver(v1);
    const s = reconcile(v1, null);
    saver.schedule(s);
    saver.schedule(s);
    vi.advanceTimersByTime(299);
    expect(set).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(set).toHaveBeenCalledTimes(1);
    saver.schedule(s);
    vi.advanceTimersByTime(300);
    expect(set).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
