import { describe, expect, it } from "vitest";
import { formatNumber, normaliseHex, snap } from "../src/format";

describe("formatNumber", () => {
  it("drops trailing zeros and float noise", () => {
    expect(formatNumber(1.6)).toBe("1.6");
    expect(formatNumber(1.0625)).toBe("1.0625");
    expect(formatNumber(96)).toBe("96");
    expect(formatNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatNumber(1.35 + 0.05)).toBe("1.4");
    expect(formatNumber(-0)).toBe("0");
  });
});

describe("snap", () => {
  it("snaps to steps from min and clamps", () => {
    expect(snap(1.07, 0.875, 1.375, 0.0625)).toBe(1.0625);
    expect(snap(99, 24, 200, 4)).toBe(100);
    expect(snap(500, 24, 200, 4)).toBe(200);
    expect(snap(1.43, 1.2, 2.2, 0.05)).toBe(1.45);
  });
});

describe("normaliseHex", () => {
  it("normalises 3 and 6 digit hex, rejects others", () => {
    expect(normaliseHex("#ABC")).toBe("#aabbcc");
    expect(normaliseHex(" #C2410C ")).toBe("#c2410c");
    expect(normaliseHex("red")).toBeNull();
    expect(normaliseHex("#12345")).toBeNull();
  });
});
