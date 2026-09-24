// Undo/redo for one version (spec §6.9). Snapshots are complete value sets.
//
// Live edits (slider drags, picker open) change the version's values without touching history.
// commit() then records one entry for the whole interaction, if anything changed since the last commit.

import { sameValues, type Values } from "./values";

export const MAX_ENTRIES = 100;

export class History {
  private past: Values[] = [];
  private future: Values[] = [];

  /** @param committed the version's values as of the last commit */
  constructor(private committed: Values) {}

  /** Records `current` as one entry. Returns false if nothing changed since the last commit. */
  commit(current: Values): boolean {
    if (sameValues(current, this.committed)) return false;
    this.past.push(this.committed);
    if (this.past.length > MAX_ENTRIES) this.past.shift();
    this.future = [];
    this.committed = current;
    return true;
  }

  /** Returns the values to show after undoing, or null if there's nothing to undo. */
  undo(current: Values): Values | null {
    this.commit(current); // fold in any uncommitted live edit first
    const prev = this.past.pop();
    if (!prev) return null;
    this.future.push(this.committed);
    this.committed = prev;
    return prev;
  }

  redo(current: Values): Values | null {
    if (!sameValues(current, this.committed)) this.commit(current); // a live edit discards the redo stack
    const next = this.future.pop();
    if (!next) return null;
    this.past.push(this.committed);
    this.committed = next;
    return next;
  }

  canUndo(current: Values): boolean {
    return this.past.length > 0 || !sameValues(current, this.committed);
  }

  canRedo(current: Values): boolean {
    return this.future.length > 0 && sameValues(current, this.committed);
  }

  get size(): number {
    return this.past.length;
  }
}
