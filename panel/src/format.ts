/**
 * Formats a number without trailing zeros or float noise (spec §6.11):
 * 1.6 → "1.6", 1.0625 → "1.0625", 0.1 + 0.2 → "0.3", 96 → "96".
 */
export function formatNumber(n: number): string {
  const rounded = Math.round(n * 1e4) / 1e4;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/** Snaps a value to the nearest step from min, then clamps into [min, max]. */
export function snap(value: number, min: number, max: number, step: number): number {
  const stepped = min + Math.round((value - min) / step) * step;
  return clamp(Math.round(stepped * 1e4) / 1e4, min, max);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const HEX6 = /^#[0-9a-f]{6}$/i;
const HEX3 = /^#[0-9a-f]{3}$/i;

export function isHex6(value: unknown): value is string {
  return typeof value === "string" && HEX6.test(value);
}

/** Normalises "#ABC" or "#AABBCC" to lowercase "#aabbcc"; returns null if not hex. */
export function normaliseHex(value: string): string | null {
  const v = value.trim();
  if (HEX6.test(v)) return v.toLowerCase();
  if (HEX3.test(v)) {
    return ("#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toLowerCase();
  }
  return null;
}
