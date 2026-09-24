import { describe, expect, it } from "vitest";
import { validateConfig } from "../src/config/validate";
import { sampleConfig } from "./fixtures";

function valid(raw: unknown) {
  const r = validateConfig(raw);
  if (!r.ok) throw new Error("expected ok, got: " + r.error);
  return r;
}

describe("validateConfig — fatal errors", () => {
  it("rejects invalid JSON text", () => {
    const r = validateConfig("{ nope");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not valid JSON/);
  });
  it("rejects a missing version", () => {
    const c = sampleConfig();
    delete c.version;
    expect(validateConfig(c)).toEqual({ ok: false, error: 'Config is missing "version".' });
  });
  it("rejects version !== 1", () => {
    expect(validateConfig({ ...sampleConfig(), version: 2 }).ok).toBe(false);
  });
  it("rejects missing tokens", () => {
    const c = sampleConfig();
    delete c.tokens;
    expect(validateConfig(c).ok).toBe(false);
  });
  it("rejects non-objects", () => {
    expect(validateConfig([]).ok).toBe(false);
    expect(validateConfig(null).ok).toBe(false);
  });
});

describe("validateConfig — valid input", () => {
  it("accepts the sample config with no warnings", () => {
    const r = valid(sampleConfig());
    expect(r.warnings).toEqual([]);
    expect(r.config.tokens).toHaveLength(9);
    expect(r.config.suggestions).toHaveLength(2);
  });
  it("accepts a JSON string", () => {
    expect(valid(JSON.stringify(sampleConfig())).config.id).toBe("sample-site");
  });
  it("lowercases colour defaults", () => {
    const c = sampleConfig();
    c.tokens[6].default = "#1C1B1A";
    expect(valid(c).config.tokens[6].default).toBe("#1c1b1a");
  });
});

describe("validateConfig — non-fatal token problems", () => {
  it("skips a token with a bad var", () => {
    const c = sampleConfig();
    c.tokens[0].var = "text-body";
    const r = valid(c);
    expect(r.config.tokens.map((t) => t.var)).not.toContain("text-body");
    expect(r.warnings[0]).toMatch(/must be a CSS variable name/);
  });
  it("skips a non-hex colour", () => {
    const c = sampleConfig();
    c.tokens[6].default = "rgb(0,0,0)";
    const r = valid(c);
    expect(r.config.tokens.find((t) => t.var === "--color-fg")).toBeUndefined();
    expect(r.warnings[0]).toMatch(/6-digit hex/);
  });
  it("skips 3-digit hex (v1 requires 6 digits)", () => {
    const c = sampleConfig();
    c.tokens[6].default = "#fff";
    expect(valid(c).config.tokens.find((t) => t.var === "--color-fg")).toBeUndefined();
  });
  it("skips min > max", () => {
    const c = sampleConfig();
    c.tokens[0].min = 2;
    const r = valid(c);
    expect(r.config.tokens.find((t) => t.var === "--text-body")).toBeUndefined();
    expect(r.warnings[0]).toMatch(/min \(2\) is greater than max/);
  });
  it("clamps a default outside the range and warns", () => {
    const c = sampleConfig();
    c.tokens[0].default = 2;
    const r = valid(c);
    expect(r.config.tokens[0].default).toBe(1.375);
    expect(r.warnings[0]).toMatch(/clamped to 1.375/);
  });
  it("skips duplicates, unknown types, bad groups and bad units", () => {
    const c = sampleConfig();
    c.tokens.push({ ...c.tokens[0] });
    c.tokens.push({ var: "--x", label: "X", group: "Typography", type: "angle", default: 1 });
    c.tokens.push({ var: "--y", label: "Y", group: "Motion", type: "number", default: 1, min: 0, max: 2, step: 1 });
    c.tokens.push({ var: "--z", label: "Z", group: "Spacing", type: "size", unit: "em", default: 1, min: 0, max: 2, step: 1 });
    const r = valid(c);
    expect(r.config.tokens).toHaveLength(9);
    expect(r.warnings).toHaveLength(4);
  });
  it("drops an unknown role but keeps the token", () => {
    const c = sampleConfig();
    c.tokens[0].role = "hero-size";
    const r = valid(c);
    expect(r.config.tokens[0].role).toBeUndefined();
    expect(r.warnings[0]).toMatch(/unknown role/);
  });
  it("skips font variables listed as tokens (fonts are not adjustable in v1)", () => {
    const c = sampleConfig();
    c.tokens.push({ var: "--font-body", label: "Body font", group: "Typography", type: "color", default: "#000000" });
    const r = valid(c);
    expect(r.config.tokens).toHaveLength(9);
    expect(r.warnings[0]).toMatch(/fonts are not adjustable in v1/);
  });
});

describe("validateConfig — suggestions", () => {
  it("skips a suggestion referencing an unknown token", () => {
    const c = sampleConfig();
    c.suggestions[0].changes["--nope"] = 1;
    const r = valid(c);
    expect(r.config.suggestions.map((s) => s.id)).toEqual(["warmer"]);
    expect(r.warnings[0]).toMatch(/unknown token --nope/);
  });
  it("ignores a suggestion's fontPair with a warning, keeping its other changes", () => {
    const c = sampleConfig();
    c.suggestions[1].fontPair = "editorial";
    const r = valid(c);
    expect(r.config.suggestions[1]).toEqual({ id: "warmer", title: "Warmer accent", reason: expect.any(String), changes: { "--color-accent": "#b4380a" } });
    expect(r.warnings[0]).toMatch(/"fontPair" is not supported in v1/);
  });
  it("skips a suggestion that only changed fonts", () => {
    const c = sampleConfig();
    c.suggestions.push({ id: "type", title: "New type", reason: "x", changes: {}, fontPair: "editorial" });
    expect(valid(c).config.suggestions).toHaveLength(2);
  });
  it("clamps out-of-range suggestion values and warns", () => {
    const c = sampleConfig();
    c.suggestions[0].changes["--text-h1"] = 9;
    const r = valid(c);
    expect(r.config.suggestions[0].changes["--text-h1"]).toBe(6);
    expect(r.warnings[0]).toMatch(/clamped to 6/);
  });
  it("skips a suggestion with a wrongly typed value", () => {
    const c = sampleConfig();
    c.suggestions[1].changes["--color-accent"] = "orange";
    expect(valid(c).config.suggestions).toHaveLength(1);
  });
});

describe("validateConfig — fonts (not in v1)", () => {
  it("ignores a fonts section with a warning", () => {
    const c = sampleConfig();
    c.fonts = { headingVar: "--font-heading", bodyVar: "--font-body", default: "x", options: [] };
    const r = valid(c);
    expect("fonts" in r.config).toBe(false);
    expect(r.warnings).toEqual(['"fonts" is not supported in v1 and is ignored.']);
  });
});
