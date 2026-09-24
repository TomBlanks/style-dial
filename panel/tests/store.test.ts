import { describe, expect, it, vi } from "vitest";
import { Store } from "../src/state/store";
import { FONT_KEY, changedKeys, defaultValues } from "../src/state/values";
import { validSample } from "./fixtures-config";

describe("defaultValues / changedKeys", () => {
  it("builds a complete value set including the font pair", () => {
    const v = defaultValues(validSample());
    expect(v["--text-h1"]).toBe(3.5);
    expect(v["--color-accent"]).toBe("#c2410c");
    expect(v[FONT_KEY]).toBe("editorial");
    expect(Object.keys(v)).toHaveLength(10);
  });
  it("lists changed keys in config order, font pair last, ignoring hex case", () => {
    const config = validSample();
    const d = defaultValues(config);
    const v = { ...d, [FONT_KEY]: "system", "--color-accent": "#C2410C", "--space-section": 112, "--text-h1": 4 };
    expect(changedKeys(config, v, d)).toEqual(["--text-h1", "--space-section", FONT_KEY]);
  });
});

describe("Store", () => {
  it("starts on Version A equal to the defaults", () => {
    const s = new Store(validSample());
    expect(s.getState().active).toBe("A");
    expect(s.changes()).toEqual([]);
  });
  it("sets values on the active version and notifies", () => {
    const s = new Store(validSample());
    const fn = vi.fn();
    s.subscribe(fn);
    s.set("--text-h1", 4);
    expect(s.shownValues()["--text-h1"]).toBe(4);
    expect(s.changes()).toEqual(["--text-h1"]);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it("does not notify when the value is unchanged", () => {
    const s = new Store(validSample());
    const fn = vi.fn();
    s.subscribe(fn);
    s.set("--text-h1", 3.5);
    expect(fn).not.toHaveBeenCalled();
  });
  it("never mutates the defaults", () => {
    const s = new Store(validSample());
    s.set("--text-h1", 4);
    expect(s.getState().defaults["--text-h1"]).toBe(3.5);
  });
});
