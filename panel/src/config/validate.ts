// Config validation — spec §5.3.
// Fatal problems return { ok: false }. Anything else is skipped or repaired
// and reported in `warnings`; the caller decides how to log them.

import { clamp, formatNumber, isHex6 } from "../format";
import {
  FRAMEWORKS, GROUPS, ROLES, UNITS,
  type ColorToken, type Framework, type Group, type Role, type Suggestion, type Token,
  type TweakConfig, type Unit,
} from "./types";

export type ValidationResult =
  | { ok: true; config: TweakConfig; warnings: string[] }
  | { ok: false; error: string };

type Obj = Record<string, unknown>;

const VAR_NAME = /^--[A-Za-z0-9_-]+$/;

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;

export function validateConfig(input: unknown): ValidationResult {
  let raw: unknown = input;
  if (typeof input === "string") {
    try {
      raw = JSON.parse(input);
    } catch (e) {
      return { ok: false, error: `Config is not valid JSON: ${(e as Error).message}` };
    }
  }
  if (!isObj(raw)) return { ok: false, error: "Config must be a JSON object." };
  if (!("version" in raw)) return { ok: false, error: 'Config is missing "version".' };
  if (raw.version !== 1) {
    return { ok: false, error: `Unsupported config version ${JSON.stringify(raw.version)} (expected 1).` };
  }
  if (!Array.isArray(raw.tokens)) {
    return { ok: false, error: 'Config is missing a "tokens" array.' };
  }

  const warnings: string[] = [];
  const warn = (msg: string) => warnings.push(msg);

  let id = "default";
  if (isStr(raw.id)) id = raw.id;
  else warn('Config has no "id"; using "default" as the storage key.');

  let framework: Framework = "html";
  if (FRAMEWORKS.includes(raw.framework as Framework)) framework = raw.framework as Framework;
  else warn(`Unknown "framework" ${JSON.stringify(raw.framework)}; assuming "html".`);

  const tailwind = raw.tailwind === true;
  if (typeof raw.tailwind !== "boolean") warn('"tailwind" should be true or false; assuming false.');

  let tokensFile = "";
  if (isStr(raw.tokensFile)) tokensFile = raw.tokensFile;
  else warn('Config has no "tokensFile"; the copied changes will not say where tokens live.');

  const tokens: Token[] = [];
  const seen = new Set<string>();
  raw.tokens.forEach((t, i) => {
    const token = validateToken(t, i, warn);
    if (!token) return;
    if (token.var === "--font-heading" || token.var === "--font-body") {
      warn(`Token ${token.var} skipped: fonts are not adjustable in v1.`);
      return;
    }
    if (seen.has(token.var)) {
      warn(`Token ${token.var} skipped: duplicate variable.`);
      return;
    }
    seen.add(token.var);
    tokens.push(token);
  });

  if (raw.fonts !== undefined) warn('"fonts" is not supported in v1 and is ignored.');

  const suggestions: Suggestion[] = [];
  if (raw.suggestions !== undefined && !Array.isArray(raw.suggestions)) {
    warn('"suggestions" should be an array; ignoring it.');
  } else if (Array.isArray(raw.suggestions)) {
    const byVar = new Map(tokens.map((t) => [t.var, t]));
    raw.suggestions.forEach((s, i) => {
      const suggestion = validateSuggestion(s, i, byVar, warn);
      if (suggestion) suggestions.push(suggestion);
    });
  }

  return {
    ok: true,
    config: { version: 1, id, framework, tailwind, tokensFile, tokens, suggestions },
    warnings,
  };
}

function validateToken(t: unknown, i: number, warn: (m: string) => void): Token | null {
  const where = `Token #${i + 1}`;
  if (!isObj(t)) {
    warn(`${where} skipped: not an object.`);
    return null;
  }
  if (typeof t.var !== "string" || !VAR_NAME.test(t.var)) {
    warn(`${where} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(t.var)}).`);
    return null;
  }
  const name = t.var;
  if (!GROUPS.includes(t.group as Group)) {
    warn(`Token ${name} skipped: "group" must be one of ${GROUPS.join(", ")}.`);
    return null;
  }
  const label = isStr(t.label) ? t.label : name;
  if (!isStr(t.label)) warn(`Token ${name} has no "label"; using the variable name.`);

  let role: Role | undefined;
  if (t.role !== undefined) {
    if (ROLES.includes(t.role as Role)) role = t.role as Role;
    else warn(`Token ${name}: unknown role ${JSON.stringify(t.role)} ignored.`);
  }
  const base = { var: name, label, group: t.group as Group, ...(role ? { role } : {}) };

  if (t.type === "color") {
    if (!isHex6(t.default)) {
      warn(`Token ${name} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(t.default)}).`);
      return null;
    }
    const token: ColorToken = { ...base, type: "color", default: t.default.toLowerCase() };
    return token;
  }

  if (t.type !== "size" && t.type !== "number") {
    warn(`Token ${name} skipped: unknown type ${JSON.stringify(t.type)}.`);
    return null;
  }
  if (!isNum(t.default) || !isNum(t.min) || !isNum(t.max) || !isNum(t.step)) {
    warn(`Token ${name} skipped: "default", "min", "max" and "step" must all be numbers.`);
    return null;
  }
  if (t.min > t.max) {
    warn(`Token ${name} skipped: min (${t.min}) is greater than max (${t.max}).`);
    return null;
  }
  if (t.step <= 0) {
    warn(`Token ${name} skipped: step must be greater than 0.`);
    return null;
  }
  let def = t.default;
  if (def < t.min || def > t.max) {
    def = clamp(def, t.min, t.max);
    warn(`Token ${name}: default ${t.default} is outside [${t.min}, ${t.max}]; clamped to ${formatNumber(def)}.`);
  }
  const range = { default: def, min: t.min, max: t.max, step: t.step };

  if (t.type === "number") return { ...base, type: "number", ...range };

  if (!UNITS.includes(t.unit as Unit)) {
    warn(`Token ${name} skipped: size "unit" must be one of ${UNITS.join(", ")}.`);
    return null;
  }
  return { ...base, type: "size", unit: t.unit as Unit, ...range };
}

function validateSuggestion(
  s: unknown,
  i: number,
  byVar: Map<string, Token>,
  warn: (m: string) => void,
): Suggestion | null {
  if (!isObj(s) || !isStr(s.id) || !isStr(s.title)) {
    warn(`Suggestion #${i + 1} skipped: needs "id" and "title".`);
    return null;
  }
  const where = `Suggestion "${s.id}"`;
  const reason = typeof s.reason === "string" ? s.reason : "";
  if (s.fontPair !== undefined) warn(`${where}: "fontPair" is not supported in v1 and is ignored.`);
  const rawChanges = isObj(s.changes) ? s.changes : {};
  const changes: Record<string, number | string> = {};
  for (const [name, value] of Object.entries(rawChanges)) {
    const token = byVar.get(name);
    if (!token) {
      warn(`${where} skipped: unknown token ${name}.`);
      return null;
    }
    if (token.type === "color") {
      if (!isHex6(value)) {
        warn(`${where} skipped: ${name} must be 6-digit hex (got ${JSON.stringify(value)}).`);
        return null;
      }
      changes[name] = value.toLowerCase();
    } else {
      if (!isNum(value)) {
        warn(`${where} skipped: ${name} must be a number (got ${JSON.stringify(value)}).`);
        return null;
      }
      const clamped = clamp(value, token.min, token.max);
      if (clamped !== value) {
        warn(`${where}: ${name} value ${value} is outside [${token.min}, ${token.max}]; clamped to ${formatNumber(clamped)}.`);
      }
      changes[name] = clamped;
    }
  }
  if (Object.keys(changes).length === 0) {
    warn(`${where} skipped: it has no changes.`);
    return null;
  }
  return { id: s.id, title: s.title, reason, changes };
}
