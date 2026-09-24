import type { FontPair, FontSpec } from "./config/types";

/** CSS value for one font variable (spec §6.5): `"<family>", <fallback>`, or just the fallback for system fonts. */
export function fontValue(spec: FontSpec): string {
  return spec.source === "system" ? spec.fallback : `"${spec.family}", ${spec.fallback}`;
}

export function pairValues(pair: FontPair): { heading: string; body: string } {
  return { heading: fontValue(pair.heading), body: fontValue(pair.body) };
}
