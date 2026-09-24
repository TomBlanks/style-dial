// Holds the panel's state and notifies subscribers on change.
// Versions and persistence are layered on in M2.2 / M2.3.

import type { TweakConfig } from "../config/types";
import { History } from "./history";
import { changedKeys, defaultValues, type Value, type Values } from "./values";

export type VersionId = "A" | "B" | "C";
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

  constructor(config: TweakConfig) {
    this.config = config;
    const defaults = defaultValues(config);
    this.state = { defaults, versions: { A: { ...defaults } }, active: "A" };
    this.histories.set("A", new History(this.state.versions.A!));
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
