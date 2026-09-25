// Holds the panel's state and notifies subscribers on change.
// Persistence (persist.ts) supplies the initial versions and saves committedVersions().

import type { TweakConfig } from "../config/types";
import { History } from "./history";
import { changedKeys, defaultValues, type Value, type Values } from "./values";

export const VERSION_IDS = ["A", "B", "C"] as const;
export type VersionId = (typeof VERSION_IDS)[number];
export type ViewId = "original" | VersionId;

export interface State {
  defaults: Values;
  versions: Partial<Record<VersionId, Values>>;
  active: ViewId;
}

type Listener = (state: State) => void;

export class Store {
  readonly config: TweakConfig;
  private state: State;
  private listeners = new Set<Listener>();
  private histories = new Map<VersionId, History>();

  constructor(config: TweakConfig, initial?: { versions: Partial<Record<VersionId, Values>>; active: ViewId }) {
    this.config = config;
    const defaults = defaultValues(config);
    const versions = initial?.versions ?? { A: { ...defaults } };
    this.state = { defaults, versions, active: initial?.active ?? "A" };
    for (const id of this.versionIds()) this.histories.set(id, new History(versions[id]!));
  }

  /** Each version's values as of its last commit (live, uncommitted edits excluded). */
  committedVersions(): Partial<Record<VersionId, Values>> {
    const out: Partial<Record<VersionId, Values>> = {};
    for (const id of this.versionIds()) out[id] = this.histories.get(id)!.current;
    return out;
  }

  getState(): State {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** The values currently shown on the page: the active version, or the defaults for Original. */
  shownValues(): Values {
    const { active, versions, defaults } = this.state;
    return active === "original" ? defaults : versions[active] ?? defaults;
  }

  /** Keys that differ from the defaults in the active version (empty for Original). */
  changes(): string[] {
    return this.changesFor(this.shownValues());
  }

  changesFor(values: Values): string[] {
    return changedKeys(this.config, values, this.state.defaults);
  }

  /** Existing versions, in letter order. */
  versionIds(): VersionId[] {
    return VERSION_IDS.filter((id) => this.state.versions[id]);
  }

  canCreateVersion(): boolean {
    return this.versionIds().length < VERSION_IDS.length;
  }

  /**
   * Creates the next version (first free letter) as a copy of what's showing now, and switches to it.
   * Returns the new id, or null when three versions already exist.
   */
  createVersion(): VersionId | null {
    const id = VERSION_IDS.find((v) => !this.state.versions[v]);
    if (!id) return null;
    this.commit();
    const values = { ...this.shownValues() };
    this.histories.set(id, new History(values));
    this.update({ versions: { ...this.state.versions, [id]: values }, active: id });
    return id;
  }

  /** Deletes a version (never the last one). If it was showing, the nearest remaining version is shown. */
  deleteVersion(id: VersionId): void {
    const ids = this.versionIds();
    if (!this.state.versions[id] || ids.length <= 1) return;
    const versions = { ...this.state.versions };
    delete versions[id];
    this.histories.delete(id);
    let active = this.state.active;
    if (active === id) {
      const i = ids.indexOf(id);
      active = ids[i - 1] ?? ids[i + 1];
    }
    this.update({ versions, active });
  }

  /** Switches between Original and an existing version. Not a history entry. */
  view(id: ViewId): void {
    if (id === this.state.active) return;
    if (id !== "original" && !this.state.versions[id]) return;
    this.commit();
    this.update({ active: id });
  }

  /** Live change to one value in the active version. Call commit() when the interaction ends. */
  set(key: string, value: Value): void {
    this.setMany({ [key]: value });
  }

  /** Live change to several values at once. Ignored while Original is showing. */
  setMany(changes: Values): void {
    const id = this.editable();
    if (!id) return;
    const current = this.state.versions[id]!;
    if (Object.entries(changes).every(([k, v]) => current[k] === v)) return;
    this.replace(id, { ...current, ...changes });
  }

  /** Ends an interaction: records one history entry if anything changed. */
  commit(): void {
    const id = this.editable();
    if (!id) return;
    if (this.histories.get(id)!.commit(this.state.versions[id]!)) this.notify();
  }

  /** Sets several values and commits them as one history entry (resets, fixes, suggestions). */
  apply(changes: Values): void {
    this.commit();
    this.setMany(changes);
    this.commit();
  }

  /** Resets the active version to the defaults, as one history entry. */
  resetAll(): void {
    this.apply(this.state.defaults);
  }

  undo(): void {
    const id = this.editable();
    if (!id) return;
    const prev = this.histories.get(id)!.undo(this.state.versions[id]!);
    if (prev) this.replace(id, prev);
  }

  redo(): void {
    const id = this.editable();
    if (!id) return;
    const next = this.histories.get(id)!.redo(this.state.versions[id]!);
    if (next) this.replace(id, next);
  }

  canUndo(): boolean {
    const id = this.editable();
    return !!id && this.histories.get(id)!.canUndo(this.state.versions[id]!);
  }

  canRedo(): boolean {
    const id = this.editable();
    return !!id && this.histories.get(id)!.canRedo(this.state.versions[id]!);
  }

  private editable(): VersionId | null {
    const { active, versions } = this.state;
    return active !== "original" && versions[active] ? active : null;
  }

  private replace(id: VersionId, values: Values): void {
    this.update({ versions: { ...this.state.versions, [id]: values } });
  }

  private update(patch: Partial<State>): void {
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this.state);
  }
}
