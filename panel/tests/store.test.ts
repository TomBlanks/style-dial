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

describe("Store versions", () => {
  it("a new version copies the active version's current values and becomes active", () => {
    const s = new Store(validSample());
    s.set("--text-h1", 4); // live, uncommitted
    expect(s.createVersion()).toBe("B");
    expect(s.getState().active).toBe("B");
    expect(s.shownValues()["--text-h1"]).toBe(4);
    s.set("--text-h1", 5);
    expect(s.getState().versions.A!["--text-h1"]).toBe(4); // A unaffected
  });
  it("creating from Original copies the defaults", () => {
    const s = new Store(validSample());
    s.apply({ "--text-h1": 4 });
    s.view("original");
    s.createVersion();
    expect(s.changes()).toEqual([]);
  });
  it("allows at most three versions", () => {
    const s = new Store(validSample());
    expect(s.createVersion()).toBe("B");
    expect(s.createVersion()).toBe("C");
    expect(s.canCreateVersion()).toBe(false);
    expect(s.createVersion()).toBeNull();
    expect(s.versionIds()).toEqual(["A", "B", "C"]);
  });
  it("deleting keeps the other letters; a new version takes the first free letter", () => {
    const s = new Store(validSample());
    s.createVersion();
    s.createVersion();
    s.deleteVersion("B");
    expect(s.versionIds()).toEqual(["A", "C"]);
    expect(s.createVersion()).toBe("B");
    s.deleteVersion("A");
    expect(s.versionIds()).toEqual(["B", "C"]);
    expect(s.createVersion()).toBe("A");
  });
  it("deleting the active version shows the nearest remaining one", () => {
    const s = new Store(validSample());
    s.createVersion(); s.createVersion(); // active C
    s.deleteVersion("C");
    expect(s.getState().active).toBe("B");
    s.view("A");
    s.deleteVersion("A");
    expect(s.getState().active).toBe("B");
  });
  it("never deletes the last version", () => {
    const s = new Store(validSample());
    s.deleteVersion("A");
    expect(s.versionIds()).toEqual(["A"]);
  });
  it("each version has its own history", () => {
    const s = new Store(validSample());
    s.apply({ "--text-h1": 4 });            // A: 3.5 → 4
    s.createVersion();                      // B starts at 4, empty history
    expect(s.canUndo()).toBe(false);
    s.apply({ "--text-h1": 5 });            // B: 4 → 5
    s.view("A");
    s.undo();                               // undo in A
    expect(s.shownValues()["--text-h1"]).toBe(3.5);
    s.view("B");
    expect(s.shownValues()["--text-h1"]).toBe(5); // B untouched
    s.undo();
    expect(s.shownValues()["--text-h1"]).toBe(4);
    expect(s.canUndo()).toBe(false);
  });
  it("a re-created version starts with a fresh history", () => {
    const s = new Store(validSample());
    s.createVersion();
    s.apply({ "--text-h1": 5 });
    s.deleteVersion("B");
    s.createVersion();
    expect(s.canUndo()).toBe(false);
  });
});

describe("Store preview", () => {
  it("shows on the page only: not in values, changes, history or committed versions", () => {
    const s = new Store(validSample());
    s.setPreview({ id: "x", changes: { "--text-h1": 5 } });
    expect(s.pageValues()["--text-h1"]).toBe(5);
    expect(s.shownValues()["--text-h1"]).toBe(3.5);
    expect(s.changes()).toEqual([]);
    expect(s.canUndo()).toBe(false);
    expect(s.committedVersions().A!["--text-h1"]).toBe(3.5);
  });
  it("any edit, undo or version switch ends it", () => {
    const s = new Store(validSample());
    const p = { id: "x", changes: { "--text-h1": 5 } };
    s.setPreview(p); s.set("--measure", 60);
    expect(s.getState().preview).toBeNull();
    s.commit(); s.setPreview(p); s.undo();
    expect(s.getState().preview).toBeNull();
    s.setPreview(p); s.createVersion();
    expect(s.getState().preview).toBeNull();
    s.setPreview(p); s.view("A");
    expect(s.getState().preview).toBeNull();
  });
  it("can't preview on Original", () => {
    const s = new Store(validSample());
    s.view("original");
    s.setPreview({ id: "x", changes: { "--text-h1": 5 } });
    expect(s.getState().preview).toBeNull();
  });
});
