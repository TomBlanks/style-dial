// Design checks C1–C14 (spec §7, plus C13/C14 — see DECISIONS.md). Pure: config + values in, results out.

import type { Role, Token, TweakConfig } from "../config/types";
import { clamp, formatNumber, snap } from "../format";
import type { Values } from "../state/values";
import { FIX_MARGIN, contrast, fixLightness, fixLightnessMulti, type Constraint } from "./color";

export interface CheckResult {
  id: string;
  severity: "warning" | "info";
  message: string;
  /** Changes that fix the issue, applied as one history entry. Absent when the rule has no fix. */
  fix?: Values;
}

export function runChecks(config: TweakConfig, values: Values): CheckResult[] {
  const byRole = new Map<Role, Token>();
  for (const t of config.tokens) if (t.role && !byRole.has(t.role)) byRole.set(t.role, t);

  const color = (role: Role) => {
    const t = byRole.get(role);
    return t?.type === "color" ? { token: t, value: String(values[t.var]) } : undefined;
  };
  /** Size in px for rem/px size tokens; undefined for anything else. */
  const px = (role: Role) => {
    const t = byRole.get(role);
    if (t?.type !== "size" || t.unit === "ch") return undefined;
    const v = Number(values[t.var]);
    return { token: t, px: t.unit === "rem" ? v * 16 : v };
  };
  const num = (role: Role) => {
    const t = byRole.get(role);
    return t && t.type !== "color" ? { token: t, value: Number(values[t.var]) } : undefined;
  };
  /** A fix value for a range token, clamped into its range. */
  const set = (t: Token, v: number) => (t.type === "color" ? {} : { [t.var]: clamp(v, t.min, t.max) });
  const ratio = (n: number) => `${n.toFixed(1)}:1`;

  const out: CheckResult[] = [];
  colourChecks(color, ratio, out);

  // C6 / C7 Line length
  const measure = byRole.get("measure");
  if (measure?.type === "size" && measure.unit === "ch") {
    const ch = Number(values[measure.var]);
    if (ch > 75) out.push({
      id: "C6", severity: "warning",
      message: `Lines of text are too long to read comfortably (${formatNumber(ch)}ch; aim for 45–75ch).`,
      fix: set(measure, 68),
    });
    else if (ch < 45) out.push({
      id: "C7", severity: "info",
      message: `Lines of text are very short (${formatNumber(ch)}ch), which makes reading choppy.`,
      fix: set(measure, 60),
    });
  }

  // C8 Body text too small
  const body = px("body-size");
  if (body && body.px < 16) out.push({
    id: "C8", severity: "warning",
    message: `Body text is small (${formatNumber(body.px)}px). 16px or more is easier to read.`,
    fix: set(body.token, body.token.type === "size" && body.token.unit === "rem" ? 1 : 16),
  });

  // C9 / C10 Body line height
  const leading = num("body-line-height");
  if (leading && leading.value < 1.4) out.push({
    id: "C9", severity: "warning",
    message: `Body line height is tight (${formatNumber(leading.value)}). Lines may feel cramped.`,
    fix: set(leading.token, 1.5),
  });
  else if (leading && leading.value > 2) out.push({
    id: "C10", severity: "info",
    message: `Body line height is loose (${formatNumber(leading.value)}). Paragraphs may feel disconnected.`,
    fix: set(leading.token, 1.7),
  });

  // C11 / C12 Type scale: h1 > h2 > h3 > body, for the roles that exist.
  const scale = (["h1-size", "h2-size", "h3-size", "body-size"] as Role[])
    .map((r) => px(r))
    .filter((s): s is NonNullable<ReturnType<typeof px>> => !!s);
  for (let i = 0; i < scale.length - 1; i++) {
    const big = scale[i];
    const small = scale[i + 1];
    const a = big.token.label;
    const b = small.token.label;
    if (big.px <= small.px) {
      out.push({
        id: `C11:${big.token.var}`, severity: "warning",
        message: big.px === small.px
          ? `${a} and ${b} are the same size (${formatNumber(big.px)}px).`
          : `${b} (${formatNumber(small.px)}px) is larger than ${a} (${formatNumber(big.px)}px).`,
        fix: hierarchyFix(scale, i, values),
      });
    } else if (big.px < small.px * 1.1) {
      out.push({
        id: `C12:${big.token.var}`, severity: "info",
        message: `${a} and ${b} are very close in size (${formatNumber(big.px)}px and ${formatNumber(small.px)}px).`,
      });
    }
  }
  return out;
}

type ScaleStep = { token: Token; px: number };

/**
 * Fix for an out-of-order pair (user decision, see DECISIONS.md). It repairs the whole type scale in one
 * click so fixes never ping-pong:
 * - Keep the size the user changed. If they changed the upper heading of the pair (or both/neither),
 *   walk down the scale moving lower headings below it (each ≥10% smaller). If they changed the lower
 *   one, or the lower one is body text, don't move anything down.
 * - Then walk up from body text, raising any size that isn't at least 10% above the one below it.
 * Body text is never changed. Sizes are snapped to each token's step (away from the clash) and clamped.
 */
function hierarchyFix(scale: ScaleStep[], i: number, values: Values): Values | undefined {
  const changed = (t: Token) => t.type !== "color" && Math.abs(Number(values[t.var]) - t.default) > 1e-9;
  const big = scale[i];
  const small = scale[i + 1];
  const moveDown = small.token.role !== "body-size" && !(changed(small.token) && !changed(big.token));

  const px = scale.map((s) => s.px);
  const isBody = (j: number) => scale[j].token.role === "body-size";
  const place = (j: number, target: number, dir: "up" | "down") => {
    const snapped = snapPx(scale[j].token, target, dir);
    if (snapped !== undefined) px[j] = snapped;
  };

  if (moveDown) {
    for (let j = i; j < px.length - 1; j++) {
      if (isBody(j + 1) || px[j + 1] * 1.1 <= px[j]) break;
      place(j + 1, px[j] / 1.1, "down");
    }
  }
  for (let j = px.length - 2; j >= 0; j--) {
    if (px[j] < px[j + 1] * 1.1) place(j, px[j + 1] * 1.1, "up");
  }

  const fix: Values = {};
  scale.forEach((s, j) => {
    if (Math.abs(px[j] - s.px) > 1e-6) fix[s.token.var] = toUnit(s.token, px[j]);
  });
  return Object.keys(fix).length ? fix : undefined;
}

const toUnit = (t: Token, px: number) => (t.type === "size" && t.unit === "rem" ? Math.round((px / 16) * 1e4) / 1e4 : px);

/** A px target snapped to the token's step (rounding away from the clash) and clamped; returned in px. */
function snapPx(t: Token, px: number, dir: "up" | "down"): number | undefined {
  if (t.type !== "size") return undefined;
  const raw = t.unit === "rem" ? px / 16 : px;
  const steps = (raw - t.min) / t.step;
  const stepped = t.min + (dir === "up" ? Math.ceil(steps - 1e-9) : Math.floor(steps + 1e-9)) * t.step;
  const value = snap(clamp(stepped, t.min, t.max), t.min, t.max, t.step);
  return t.unit === "rem" ? value * 16 : value;
}

type Colour = { token: Token; value: string };

/**
 * Colour checks. Text and the accent sit on both the page background and the card surface, so every
 * colour fix looks for one lightness that satisfies all the pairs the colour is part of — otherwise
 * fixes would undo each other (see the C1/C5 and C13/C14 notes in DECISIONS.md):
 *   body text, muted text: 4.5:1 on the background and on the surface
 *   accent: 3:1 on the background and on the surface, and 4.5:1 under its text colour
 * When no such colour exists, page checks fix against the page only, and card checks adjust the
 * card colour instead (against everything that sits on it).
 */
function colourChecks(color: (role: Role) => Colour | undefined, ratio: (n: number) => string, out: CheckResult[]) {
  const fg = color("body-text");
  const muted = color("muted-text");
  const bg = color("background");
  const surface = color("surface");
  const accent = color("accent");
  const accentText = color("accent-text");

  const on = (c: Colour | undefined, t: number): Constraint[] => (c ? [[c.value, t]] : []);
  /** Constraint sets to try for a colour, most complete first. */
  const attempts = (x: Colour, t: number): Constraint[][] => {
    const places = [...on(bg, t), ...on(surface, t)];
    if (x !== accent || !accentText) return [places];
    // The accent also keeps its button text readable if it can (user decision); otherwise just visible.
    return [[...places, ...on(accentText, 4.5)], places, [...on(bg, t), ...on(accentText, 4.5)]];
  };
  const joint = (x: Colour, t: number) => {
    for (const cs of attempts(x, t)) {
      const fixed = fixLightnessMulti(x.value, cs, FIX_MARGIN);
      if (fixed) return fixed;
    }
    return null;
  };
  const surfaceFix = () => {
    if (!surface) return null;
    const cs: Constraint[] = [...on(fg, 4.5), ...on(muted, 4.5), ...on(accent, 3)];
    return fixLightnessMulti(surface.value, cs, FIX_MARGIN);
  };

  const page = (id: string, x: Colour | undefined, t: number, what: string) => {
    if (!x || !bg) return;
    const c = contrast(x.value, bg.value);
    if (c >= t) return;
    out.push({
      id, severity: "warning",
      message: `${what} on this background (${ratio(c)}, needs ${t}:1).`,
      fix: { [x.token.var]: joint(x, t) ?? fixLightness(x.value, bg.value, t, FIX_MARGIN) },
    });
  };
  const card = (id: string, x: Colour | undefined, t: number, what: string) => {
    if (!x || !surface) return;
    const c = contrast(x.value, surface.value);
    if (c >= t) return;
    const own = joint(x, t);
    const adjusted = !own && bg ? surfaceFix() : null;
    out.push({
      id, severity: "warning",
      message: `${what} on cards and panels (${ratio(c)}, needs ${t}:1).` +
        (adjusted ? " No single colour works on both the page and the cards, so Fix adjusts the card colour." : ""),
      fix: adjusted
        ? { [surface.token.var]: adjusted }
        : { [x.token.var]: own ?? fixLightness(x.value, surface.value, t, FIX_MARGIN) },
    });
  };

  page("C1", fg, 4.5, "Body text is hard to read");
  page("C2", muted, 4.5, "Muted text is hard to read");
  page("C3", accent, 3, "The accent colour is hard to see");
  // C4 Text on accent: switch to white or black, whichever contrasts more.
  if (accentText && accent) {
    const c = contrast(accentText.value, accent.value);
    if (c < 4.5) {
      const best = contrast("#ffffff", accent.value) >= contrast("#000000", accent.value) ? "#ffffff" : "#000000";
      out.push({
        id: "C4", severity: "warning",
        message: `Text on the accent colour is hard to read (${ratio(c)}, needs 4.5:1).`,
        fix: { [accentText.token.var]: best },
      });
    }
  }
  card("C5", fg, 4.5, "Body text is hard to read");
  card("C13", muted, 4.5, "Muted text is hard to read");
  card("C14", accent, 3, "The accent colour is hard to see");
}
