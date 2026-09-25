// Colour maths for the checks (spec §7): WCAG 2.x contrast and the OKLCH lightness fix.

type RGB = [number, number, number]; // 0–1 sRGB
interface OKLCH { l: number; c: number; h: number }

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  const to = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

/** WCAG 2.x relative luminance. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// OKLab (Björn Ottosson, 2020).
export function hexToOklch(hex: string): OKLCH {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B);
  const h = c < 1e-6 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

/** OKLCH → linear sRGB (may be out of gamut). */
function oklchToLinear({ l, c, h }: OKLCH): RGB {
  const hr = (h * Math.PI) / 180;
  const A = c * Math.cos(hr);
  const B = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (rgb: RGB) => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);

/** OKLCH → hex, reducing chroma (keeping L and h) until the colour fits in sRGB. */
export function oklchToHex(color: OKLCH): string {
  const l = Math.min(1, Math.max(0, color.l));
  let rgb = oklchToLinear({ ...color, l });
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = color.c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinear({ l, c: lo, h: color.h });
  }
  return rgbToHex(rgb.map((v) => fromLinear(Math.min(1, Math.max(0, v)))) as RGB);
}

/** True when the background is light, i.e. dark text contrasts more with it than light text. */
export function isLightBackground(bg: string): boolean {
  return contrast(bg, "#000000") >= contrast(bg, "#ffffff");
}

/** Fixes aim this far above the target ratio so a small tweak afterwards doesn't immediately fail again. */
export const FIX_MARGIN = 0.1;

/**
 * Changes only the OKLCH lightness of `fg` (hue and chroma kept, chroma clamped into gamut) to the
 * closest value that reaches `target` contrast against `bg`. It searches darker on light backgrounds
 * and lighter on dark ones. If even the end of that range isn't enough, it returns #000000 or #ffffff.
 * If `fg` already meets the target it is returned unchanged. With a `margin`, the search aims for
 * target + margin, or for the plain target if the margin can't be reached.
 */
export function fixLightness(fg: string, bg: string, target: number, margin = 0): string {
  if (contrast(fg, bg) >= target + margin) return fg;
  const start = hexToOklch(fg);
  const darker = isLightBackground(bg);
  const end = darker ? 0 : 1;
  const at = (l: number) => oklchToHex({ ...start, l });

  if (contrast(at(end), bg) < target + margin) {
    if (margin > 0) return fixLightness(fg, bg, target);
    return darker ? "#000000" : "#ffffff";
  }
  target += margin;

  // Binary search between the current lightness (fails) and the end (passes) for the closest pass.
  let fail = start.l;
  let pass = end;
  for (let i = 0; i < 40; i++) {
    const mid = (fail + pass) / 2;
    if (contrast(at(mid), bg) >= target) pass = mid;
    else fail = mid;
  }
  return at(pass);
}

/** "This colour needs at least `target`:1 against `other`." */
export type Constraint = [other: string, target: number];

/**
 * The closest lightness change to `color` (hue and chroma kept) that meets **every** constraint,
 * searching both darker and lighter. Aims for target + `margin` first, then the plain targets.
 * Returns null if no lightness satisfies them all.
 */
export function fixLightnessMulti(color: string, constraints: Constraint[], margin = 0): string | null {
  const meets = (hex: string, extra: number) => constraints.every(([o, t]) => contrast(hex, o) >= t + extra);
  if (meets(color, margin)) return color;
  const start = hexToOklch(color);
  const at = (l: number) => oklchToHex({ ...start, l });

  const search = (end: number, extra: number): number | null => {
    // Find the passing point nearest to `start` between start and end (sampled, then refined).
    const steps = 200;
    let prev = start.l;
    for (let i = 1; i <= steps; i++) {
      const l = start.l + ((end - start.l) * i) / steps;
      if (meets(at(l), extra)) {
        let fail = prev;
        let pass = l;
        for (let j = 0; j < 30; j++) {
          const mid = (fail + pass) / 2;
          if (meets(at(mid), extra)) pass = mid;
          else fail = mid;
        }
        return pass;
      }
      prev = l;
    }
    return null;
  };

  for (const extra of margin > 0 ? [margin, 0] : [0]) {
    const options = [search(0, extra), search(1, extra)].filter((l): l is number => l !== null);
    if (options.length) {
      const best = options.reduce((a, b) => (Math.abs(a - start.l) <= Math.abs(b - start.l) ? a : b));
      return at(best);
    }
  }
  return null;
}

/** Same as fixLightnessMulti with one target against several backgrounds. */
export function fixLightnessForAll(fg: string, bgs: string[], target: number, margin = 0): string | null {
  return fixLightnessMulti(fg, bgs.map((b): Constraint => [b, target]), margin);
}
