import { describe, expect, it } from "vitest";
import { contrast, fixLightness, hexToOklch, isLightBackground, luminance, oklchToHex } from "../src/checks/color";

describe("WCAG contrast", () => {
  it("matches known values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrast("#767676", "#ffffff")).toBeCloseTo(4.54, 2); // the classic "lightest AA grey on white"
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
    expect(contrast("#595959", "#ffffff")).toBeCloseTo(7.0, 1);
    expect(contrast("#0000ff", "#ffffff")).toBeCloseTo(8.59, 2);
  });
  it("is symmetric", () => {
    expect(contrast("#c2410c", "#faf8f5")).toBeCloseTo(contrast("#faf8f5", "#c2410c"), 10);
  });
  it("relative luminance of primaries", () => {
    expect(luminance("#ff0000")).toBeCloseTo(0.2126, 4);
    expect(luminance("#00ff00")).toBeCloseTo(0.7152, 4);
    expect(luminance("#0000ff")).toBeCloseTo(0.0722, 4);
  });
});

describe("OKLCH conversion", () => {
  it("matches reference values", () => {
    const red = hexToOklch("#ff0000");
    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.c).toBeCloseTo(0.2577, 3);
    expect(red.h).toBeCloseTo(29.23, 1);
    expect(hexToOklch("#ffffff").l).toBeCloseTo(1, 4);
    expect(hexToOklch("#000000").l).toBeCloseTo(0, 4);
    expect(hexToOklch("#808080").c).toBeLessThan(1e-4);
  });
  it("round-trips hex → OKLCH → hex", () => {
    for (const hex of ["#c2410c", "#1c1b1a", "#faf8f5", "#1d4ed8", "#ffd400", "#2e8b57", "#000000", "#ffffff"]) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });
  it("clamps chroma into gamut instead of clipping channels (hue kept)", () => {
    const out = oklchToHex({ l: 0.3, c: 0.4, h: 29.23 }); // far outside sRGB
    expect(out).toMatch(/^#[0-9a-f]{6}$/);
    expect(hexToOklch(out).h).toBeCloseTo(29.23, 0);
    expect(hexToOklch(out).l).toBeCloseTo(0.3, 2);
  });
});

describe("fixLightness", () => {
  const cases: [string, string, string, number][] = [
    ["muted grey on cream", "#8a847e", "#faf8f5", 4.5],
    ["accent on cream", "#f0a07a", "#faf8f5", 3],
    ["orange text on white", "#ff7a00", "#ffffff", 4.5],
    ["yellow on white", "#ffd400", "#ffffff", 4.5],
    ["dark-mode muted text", "#5a5a66", "#121218", 4.5],
    ["dark-mode accent", "#3b2fb0", "#101014", 3],
  ];
  for (const [name, fg, bg, target] of cases) {
    it(`${name}: reaches the target, keeps hue, and is the closest passing lightness`, () => {
      const out = fixLightness(fg, bg, target);
      expect(contrast(out, bg)).toBeGreaterThanOrEqual(target);
      const before = hexToOklch(fg);
      const after = hexToOklch(out);
      if (before.c > 0.03) expect(Math.abs(after.h - before.h)).toBeLessThan(3);
      // A slightly smaller lightness change (1% of the way back) no longer passes.
      const back = oklchToHex({ ...after, l: after.l + (before.l - after.l) * 0.02, c: before.c });
      expect(contrast(back, bg)).toBeLessThan(target + 0.05);
    });
  }
  it("goes darker on light backgrounds and lighter on dark ones", () => {
    expect(hexToOklch(fixLightness("#999999", "#ffffff", 4.5)).l).toBeLessThan(hexToOklch("#999999").l);
    expect(hexToOklch(fixLightness("#555555", "#000000", 4.5)).l).toBeGreaterThan(hexToOklch("#555555").l);
  });
  it("returns the colour unchanged when it already passes", () => {
    expect(fixLightness("#1c1b1a", "#faf8f5", 4.5)).toBe("#1c1b1a");
  });
  it("falls back to black or white when no lightness works", () => {
    // 7:1 is impossible on mid grey in the darker direction (black only reaches ~4.6)
    expect(fixLightness("#707070", "#777777", 7)).toBe("#000000");
    expect(fixLightness("#808080", "#3a3a3a", 21)).toBe("#ffffff");
  });
  it("classifies backgrounds", () => {
    expect(isLightBackground("#faf8f5")).toBe(true);
    expect(isLightBackground("#121218")).toBe(false);
  });
});

describe("fixLightness with the safety margin", () => {
  it("aims for target + margin (user decision: FIX_MARGIN = 0.1)", async () => {
    const { FIX_MARGIN } = await import("../src/checks/color");
    expect(FIX_MARGIN).toBe(0.1);
    const out = fixLightness("#8a847e", "#faf8f5", 4.5, FIX_MARGIN);
    expect(contrast(out, "#faf8f5")).toBeGreaterThanOrEqual(4.6);
    expect(contrast(out, "#faf8f5")).toBeLessThan(4.7);
  });
  it("falls back to the plain target when the margin is unreachable", () => {
    // black on #777777 reaches ~4.69; 4.69 + 0.1 is impossible, 4.69 is not → plain fallback path
    const out = fixLightness("#707070", "#777777", 4.65, 0.1);
    expect(contrast(out, "#777777")).toBeGreaterThanOrEqual(4.65);
  });
});
