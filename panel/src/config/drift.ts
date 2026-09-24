// Spec §5.3: warn when the config's defaults no longer match what the page's CSS declares.

import { formatNumber, normaliseHex } from "../format";
import { pairValues } from "../fonts";
import type { Token, TweakConfig } from "./types";

/** Reads a custom property's declared value, e.g. from getComputedStyle(document.documentElement). */
export type ReadVar = (name: string) => string;

export function findStaleDefaults(config: TweakConfig, read: ReadVar): string[] {
  const messages: string[] = [];
  for (const token of config.tokens) {
    const actual = read(token.var).trim();
    if (actual === "") {
      messages.push(`${token.var} is in the config but not declared on :root.`);
    } else if (!matchesDefault(token, actual)) {
      messages.push(`${token.var}: config default is ${expected(token)} but the page has ${actual}.`);
    }
  }
  if (config.fonts) {
    const pair = config.fonts.options.find((p) => p.id === config.fonts!.default)!;
    const want = pairValues(pair);
    for (const [name, value] of [["--font-heading", want.heading], ["--font-body", want.body]] as const) {
      const actual = read(name).trim();
      if (actual && normaliseFont(actual) !== normaliseFont(value)) {
        messages.push(`${name}: config default pair "${pair.id}" is ${value} but the page has ${actual}.`);
      }
    }
  }
  return messages;
}

function expected(token: Token): string {
  if (token.type === "color") return token.default;
  if (token.type === "size") return formatNumber(token.default) + token.unit;
  return formatNumber(token.default);
}

function matchesDefault(token: Token, actual: string): boolean {
  if (token.type === "color") return normaliseHex(actual) === token.default;
  const unit = token.type === "size" ? token.unit : "";
  const m = /^(-?\d*\.?\d+)([a-z%]*)$/i.exec(actual);
  if (!m || m[2].toLowerCase() !== unit) return false;
  return Math.abs(parseFloat(m[1]) - token.default) < 1e-4;
}

function normaliseFont(v: string): string {
  return v.replace(/['"]/g, "").replace(/\s*,\s*/g, ",").replace(/\s+/g, " ").toLowerCase();
}
