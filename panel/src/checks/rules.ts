// Design checks C1–C12 (spec §7). Pure: config + values in, results out.

import type { Role, Token, TweakConfig } from "../config/types";
import { clamp, formatNumber, snap } from "../format";
import type { Values } from "../state/values";
import { FIX_MARGIN, contrast, fixLightness, fixLightnessForAll } from "./color";

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
  const fg = color("body-text");
  const muted = color("muted-text");
  const bg = color("background");
  const surface = color("surface");
  const accent = color("accent");
  const accentText = color("accent-text");
  // Body text sits on both the page background and the card surface, so C1 and C5 must agree:
  // prefer one text colour that reads on both. If none exists (e.g. light page, dark cards),
  // C1 fixes the text against the page and C5 fixes the card colour instead (no ping-pong).
  const textOnBoth = fg && bg && surface
    ? fixLightnessForAll(fg.value, [bg.value, surface.value], 4.5, FIX_MARGIN)
    : undefined;

  // C1 Body text contrast
  if (fg && bg) {
    const c = contrast(fg.value, bg.value);
    if (c < 4.5) out.push({
      id: "C1", severity: "warning",
      message: `Body text is hard to read on this background (${ratio(c)}, needs 4.5:1).`,
      fix: { [fg.token.var]: textOnBoth ?? fixLightness(fg.value, bg.value, 4.5, FIX_MARGIN) },
    });
  }
  // C2 Muted text contrast
  if (muted && bg) {
    const c = contrast(muted.value, bg.value);
    if (c < 4.5) out.push({
      id: "C2", severity: "warning",
      message: `Muted text is hard to read on this background (${ratio(c)}, needs 4.5:1).`,
      fix: { [muted.token.var]: fixLightness(muted.value, bg.value, 4.5, FIX_MARGIN) },
    });
  }
  // C3 Accent visibility
  if (accent && bg) {
    const c = contrast(accent.value, bg.value);
    if (c < 3) {
      let fixed = fixLightness(accent.value, bg.value, 3, FIX_MARGIN);
      // Keep text on the accent readable too, if moving further the same way can do it (user decision).
      if (accentText && contrast(accentText.value, fixed) < 4.5) {
        const both = fixLightness(fixed, accentText.value, 4.5, FIX_MARGIN);
        if (contrast(both, bg.value) >= 3 && contrast(both, accentText.value) >= 4.5) fixed = both;
      }
      out.push({
        id: "C3", severity: "warning",
        message: `The accent colour is hard to see on this background (${ratio(c)}, needs 3:1).`,
        fix: { [accent.token.var]: fixed },
      });
    }
  }
  // C4 Text on accent
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
  // C5 Surface text contrast
  if (fg && surface) {
    const c = contrast(fg.value, surface.value);
    if (c < 4.5) {
      const fixSurface = !!bg && !textOnBoth;
      out.push({
        id: "C5", severity: "warning",
        message: `Body text is hard to read on cards and panels (${ratio(c)}, needs 4.5:1).` +
          (fixSurface ? " No text colour works on both the page and the cards, so Fix adjusts the card colour." : ""),
        fix: fixSurface
          ? { [surface.token.var]: fixLightness(surface.value, fg.value, 4.5, FIX_MARGIN) }
          : { [fg.token.var]: textOnBoth ?? fixLightness(fg.value, surface.value, 4.5, FIX_MARGIN) },
      });
    }
  }

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
