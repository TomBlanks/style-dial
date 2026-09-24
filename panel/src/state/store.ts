// Holds the panel's state and notifies subscribers on change.
// M1: a single editable version (A) plus the read-only Original view.
// History, more versions and persistence are layered on in M2.

import type { TweakConfig } from "../config/types";
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

  constructor(config: TweakConfig) {
    this.config = config;
    const defaults = defaultValues(config);
    this.state = { defaults, versions: { A: { ...defaults } }, active: "A" };
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
    return changedKeys(this.config, this.shownValues(), this.state.defaults);
  }

  /** Sets one value in the active version. Ignored while Original is showing. */
  set(key: string, value: Value): void {
    const { active, versions } = this.state;
    if (active === "original") return;
    const current = versions[active];
    if (!current || current[key] === value) return;
    this.update({ versions: { ...versions, [active]: { ...current, [key]: value } } });
  }

  private update(patch: Partial<State>): void {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(this.state);
  }
}
