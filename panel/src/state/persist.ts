// localStorage persistence and reconciliation on load (spec §9).

import type { Token, TweakConfig } from "../config/types";
import { clamp, isHex6 } from "../format";
import { VERSION_IDS, type VersionId, type ViewId } from "./store";
import { defaultValues, sameValue, type Values } from "./values";

export type TabId = "controls" | "checks" | "suggestions";
const TABS: TabId[] = ["controls", "checks", "suggestions"];

export interface UiState {
  expanded: boolean;
  tab: TabId;
  active: ViewId;
}

export interface Saved {
  baseDefaults: Values;
  versions: Partial<Record<VersionId, Values>>;
  ui: UiState;
}

export const storageKey = (config: TweakConfig) => `design-tweaker:v1:${config.id}`;

export const DEFAULT_UI: UiState = { expanded: true, tab: "controls", active: "A" };

/**
 * Brings stored versions up to date with the config's current defaults:
 * - token removed from config → removed from every version
 * - token added → added to every version at its new default
 * - default unchanged → versions keep their values
 * - default changed and some version already has the new default → the user applied that version via Claude; keep all
 * - default changed and no version has it → the code changed some other way; the source wins in every version
 * Stored values that are malformed or out of range are repaired.
 */
export function reconcile(config: TweakConfig, raw: unknown): Saved {
  const defaults = defaultValues(config);
  const stored = isObj(raw) ? raw : {};
  const base = isObj(stored.baseDefaults) ? (stored.baseDefaults as Values) : {};
  const rawVersions = isObj(stored.versions) ? stored.versions : {};

  const versions: Partial<Record<VersionId, Values>> = {};
  for (const id of VERSION_IDS) {
    if (isObj(rawVersions[id])) versions[id] = {};
  }
  if (!Object.keys(versions).length) versions.A = {};

  for (const token of config.tokens) {
    const name = token.var;
    const def = defaults[name];
    const known = name in base;
    const defaultChanged = known && !sameValue(base[name], def);
    const stale = defaultChanged && !Object.keys(versions).some((id) =>
      sameValue(clean(token, (rawVersions[id] as Values)[name]), def));

    for (const id of Object.keys(versions) as VersionId[]) {
      const value = clean(token, (rawVersions[id] as Values | undefined)?.[name]);
      versions[id]![name] = !known || stale || value === undefined ? def : value;
    }
  }

  const ui = isObj(stored.ui) ? stored.ui : {};
  const ids = Object.keys(versions) as VersionId[];
  let active: ViewId = ui.active === "original" || ids.includes(ui.active as VersionId) ? (ui.active as ViewId) : "A";
  if (active !== "original" && !versions[active]) active = ids[0];

  return {
    baseDefaults: defaults,
    versions,
    ui: {
      expanded: typeof ui.expanded === "boolean" ? ui.expanded : DEFAULT_UI.expanded,
      tab: TABS.includes(ui.tab as TabId) ? (ui.tab as TabId) : DEFAULT_UI.tab,
      active,
    },
  };
}

/** A stored value in the right shape for its token, or undefined if unusable. */
function clean(token: Token, value: unknown): number | string | undefined {
  if (token.type === "color") return isHex6(value) ? value.toLowerCase() : undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return clamp(value, token.min, token.max);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Reads, reconciles and writes back. Works without storage (returns a fresh state). */
export function load(config: TweakConfig): Saved {
  let raw: unknown = null;
  try {
    const text = localStorage.getItem(storageKey(config));
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = null;
  }
  const saved = reconcile(config, raw);
  save(config, saved);
  return saved;
}

export function save(config: TweakConfig, saved: Saved): void {
  try {
    localStorage.setItem(storageKey(config), JSON.stringify(saved));
  } catch {
    // storage unavailable or full: the panel keeps working without persistence
  }
}

/** Debounced writer (300ms) that skips writes when nothing changed. */
export function createSaver(config: TweakConfig, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let last = "";
  let pending: Saved | null = null;
  const flush = () => {
    clearTimeout(timer);
    timer = undefined;
    if (!pending) return;
    const text = JSON.stringify(pending);
    if (text !== last) {
      last = text;
      save(config, pending);
    }
    pending = null;
  };
  return {
    schedule(saved: Saved) {
      pending = saved;
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    flush,
  };
}
