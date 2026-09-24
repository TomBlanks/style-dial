import { describe, expect, it, vi } from "vitest";
import { Store } from "../src/state/store";
import { changedKeys, defaultValues } from "../src/state/values";
import { validSample } from "./fixtures-config";

describe("defaultValues / changedKeys", () => {
  it("builds a complete value set", () => {
    const v = defaultValues(validSample());
    expect(v["--text-h1"]).toBe(3.5);
    expect(v["--color-accent"]).toBe("#c2410c");
    expect(Object.keys(v)).toHaveLength(9);
  });
  it("lists changed keys in config order, ignoring hex case", () => {
    const config = validSample();
    const d = defaultValues(config);
    const v = { ...d, "--color-accent": "#C2410C", "--space-section": 112, "--text-h1": 4 };
    expect(changedKeys(config, v, d)).toEqual(["--text-h1", "--space-section"]);
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

describe("Store history", () => {
  it("set + commit is one undoable entry; undo restores and redo re-applies", () => {
    const s = new Store(validSample());
    s.set("--text-h1", 4);
    s.set("--text-h1", 4.5);
    s.commit();
    s.undo();
    expect(s.shownValues()["--text-h1"]).toBe(3.5);
    s.redo();
    expect(s.shownValues()["--text-h1"]).toBe(4.5);
  });
  it("resetAll is one entry and can be undone", () => {
    const s = new Store(validSample());
    s.apply({ "--text-h1": 4 });
    s.apply({ "--color-accent": "#000000" });
    s.resetAll();
    expect(s.changes()).toEqual([]);
    s.undo();
    expect(s.changes()).toEqual(["--text-h1", "--color-accent"]);
  });
  it("apply sets several values as one entry", () => {
    const s = new Store(validSample());
    s.apply({ "--text-h1": 4, "--space-section": 120 });
    s.undo();
    expect(s.changes()).toEqual([]);
    expect(s.canUndo()).toBe(false);
  });
  it("undo, redo and edits are disabled while Original is showing; switching is not an entry", () => {
    const s = new Store(validSample());
    s.apply({ "--text-h1": 4 });
    s.view("original");
    expect(s.canUndo()).toBe(false);
    s.undo();
    s.set("--text-h1", 5);
    s.view("A");
    expect(s.shownValues()["--text-h1"]).toBe(4);
    s.undo();
    expect(s.shownValues()["--text-h1"]).toBe(3.5);
    expect(s.canUndo()).toBe(false);
  });
});
