import { describe, expect, it } from "vitest";
import { History, MAX_ENTRIES } from "../src/state/history";

const v = (n: number) => ({ "--x": n });

describe("History", () => {
  it("records one entry per commit, ignoring no-op commits", () => {
    const h = new History(v(0));
    expect(h.commit(v(0))).toBe(false);
    expect(h.commit(v(1))).toBe(true);
    expect(h.commit(v(1))).toBe(false);
    expect(h.size).toBe(1);
  });
  it("a drag (many live values, one commit) is one entry", () => {
    const h = new History(v(0));
    // live values 1..9 never reach history; only the release commits
    h.commit(v(9));
    expect(h.undo(v(9))).toEqual(v(0));
    expect(h.canUndo(v(0))).toBe(false);
  });
  it("undo and redo walk the stack; a new commit clears redo", () => {
    const h = new History(v(0));
    h.commit(v(1));
    h.commit(v(2));
    expect(h.undo(v(2))).toEqual(v(1));
    expect(h.undo(v(1))).toEqual(v(0));
    expect(h.undo(v(0))).toBeNull();
    expect(h.redo(v(0))).toEqual(v(1));
    expect(h.canRedo(v(1))).toBe(true);
    h.commit(v(5));
    expect(h.canRedo(v(5))).toBe(false);
    expect(h.redo(v(5))).toBeNull();
  });
  it("undo folds in an uncommitted live edit first", () => {
    const h = new History(v(0));
    h.commit(v(1));
    expect(h.canUndo(v(7))).toBe(true);
    expect(h.undo(v(7))).toEqual(v(1)); // 7 was recorded, then undone
    expect(h.redo(v(1))).toEqual(v(7));
  });
  it("a live edit after undo disables redo", () => {
    const h = new History(v(0));
    h.commit(v(1));
    h.undo(v(1));
    expect(h.canRedo(v(3))).toBe(false);
  });
  it(`keeps at most ${MAX_ENTRIES} entries, dropping the oldest`, () => {
    const h = new History(v(0));
    for (let i = 1; i <= MAX_ENTRIES + 20; i++) h.commit(v(i));
    expect(h.size).toBe(MAX_ENTRIES);
    let last: any = v(MAX_ENTRIES + 20);
    for (let i = 0; i < MAX_ENTRIES; i++) last = h.undo(last);
    expect(last).toEqual(v(20)); // entries 0..19 were dropped
    expect(h.undo(last)).toBeNull();
  });
});
