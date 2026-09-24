// A "value set" is one complete set of token values plus the font pair (spec §9).

import type { Token, TweakConfig } from "../config/types";

/** Key used for the font pair inside a value set, matching the storage format in §9. */
export const FONT_KEY = "fontPair";

export type Value = number | string;
export type Values = Record<string, Value>;

export function defaultValues(config: TweakConfig): Values {
  const values: Values = {};
  for (const t of config.tokens) values[t.var] = t.default;
  if (config.fonts) values[FONT_KEY] = config.fonts.default;
  return values;
}

/** Keys (token vars, then FONT_KEY) whose value differs from the defaults, in config order. */
export function changedKeys(config: TweakConfig, values: Values, defaults: Values): string[] {
  const keys = config.tokens.map((t) => t.var);
  if (config.fonts) keys.push(FONT_KEY);
  return keys.filter((k) => !sameValue(values[k], defaults[k]));
}

export function sameValue(a: Value | undefined, b: Value | undefined): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9;
  if (typeof a === "string" && typeof b === "string") return a.toLowerCase() === b.toLowerCase();
  return a === b;
}

export function tokenByVar(config: TweakConfig, name: string): Token | undefined {
  return config.tokens.find((t) => t.var === name);
}
