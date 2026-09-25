import { describe, expect, it } from "vitest";
import { contrast } from "../src/checks/color";
import { runChecks } from "../src/checks/rules";
import { defaultValues } from "../src/state/values";
import { validSample } from "./fixtures-config";

// The sample config plus every optional role, so every rule can run.
const full = validSample((c) => {
  c.tokens.push(
    { var: "--text-h3", label: "Heading 3", group: "Typography", role: "h3-size", type: "size", unit: "rem", default: 1.5, min: 1.125, max: 2.5, step: 0.0625 },
    { var: "--color-muted", label: "Muted text", group: "Colour", role: "muted-text", type: "color", default: "#5f5b57" },
    { var: "--color-surface", label: "Surface", group: "Colour", role: "surface", type: "color", default: "#ffffff" },
    { var: "--color-accent-fg", label: "Text on accent", group: "Colour", role: "accent-text", type: "color", default: "#ffffff" },
  );
});
const d = defaultValues(full);
const ids = (v: Record<string, unknown>) => runChecks(full, { ...d, ...v } as any).map((r) => r.id);
const one = (id: string, v: Record<string, unknown>) => runChecks(full, { ...d, ...v } as any).find((r) => r.id === id)!;
const afterFix = (id: string, v: Record<string, unknown>) => {
  const values = { ...d, ...v } as any;
  return runChecks(full, { ...values, ...one(id, v).fix }).map((r) => r.id);
};

describe("runChecks", () => {
  it("the well-designed sample has no issues", () => {
    expect(runChecks(full, d)).toEqual([]);
  });

  it("C1 body text contrast: triggers, fixes with the margin, respects the surface too", () => {
    const r = one("C1", { "--color-fg": "#aaaaaa" });
    expect(r.severity).toBe("warning");
    expect(r.message).toBe("Body text is hard to read on this background (2.2:1, needs 4.5:1).");
    const fixed = r.fix!["--color-fg"] as string;
    expect(contrast(fixed, "#faf8f5")).toBeGreaterThanOrEqual(4.6);
    expect(contrast(fixed, "#ffffff")).toBeGreaterThanOrEqual(4.6);
    expect(afterFix("C1", { "--color-fg": "#aaaaaa" })).not.toContain("C1");
  });
  it("C2 muted text contrast", () => {
    expect(ids({ "--color-muted": "#b0aaa5" })).toEqual(["C2"]);
    expect(afterFix("C2", { "--color-muted": "#b0aaa5" })).toEqual([]);
  });
  it("C3 accent visibility at 3:1", () => {
    expect(ids({ "--color-accent": "#fbbf99" })).toContain("C3");
    expect(ids({ "--color-accent": "#e0703a" })).not.toContain("C3"); // ~3.1:1 passes
    expect(afterFix("C3", { "--color-accent": "#fbbf99" })).not.toContain("C3");
  });
  it("C4 text on accent picks white or black, whichever contrasts more", () => {
    expect(one("C4", { "--color-accent-fg": "#dddddd" }).fix).toEqual({ "--color-accent-fg": "#ffffff" });
    const yellow = { "--color-accent": "#ffd400", "--color-accent-fg": "#ffffff" };
    expect(one("C4", yellow).fix).toEqual({ "--color-accent-fg": "#000000" });
  });
  it("C5 surface text contrast (dark cards on a light page are fixed against the surface only)", () => {
    const v = { "--color-surface": "#555555" };
    expect(ids(v)).toContain("C5");
    expect(afterFix("C5", v)).not.toContain("C5");
  });
  it("C6 lines too long → 68ch; C7 very short (info) → 60ch", () => {
    expect(one("C6", { "--measure": 90 }).fix).toEqual({ "--measure": 68 });
    const c7 = one("C7", { "--measure": 40 });
    expect(c7.severity).toBe("info");
    expect(c7.fix).toEqual({ "--measure": 60 });
    expect(ids({ "--measure": 75 })).toEqual([]);
    expect(ids({ "--measure": 45 })).toEqual([]);
  });
  it("C8 body text under 16px → 1rem", () => {
    const r = one("C8", { "--text-body": 0.875 });
    expect(r.message).toBe("Body text is small (14px). 16px or more is easier to read.");
    expect(r.fix).toEqual({ "--text-body": 1 });
  });
  it("C9 tight line height → 1.5; C10 loose (info) → 1.7", () => {
    expect(one("C9", { "--leading-body": 1.3 }).fix).toEqual({ "--leading-body": 1.5 });
    expect(one("C10", { "--leading-body": 2.1 }).fix).toEqual({ "--leading-body": 1.7 });
    expect(one("C10", { "--leading-body": 2.1 }).severity).toBe("info");
    expect(ids({ "--leading-body": 1.4 })).toEqual([]);
    expect(ids({ "--leading-body": 2 })).toEqual([]);
  });
  it("C11 heading hierarchy names the pair out of order", () => {
    expect(one("C11:--text-h1", { "--text-h1": 2 }).message).toBe("Heading 2 (36px) is larger than Heading 1 (32px).");
    expect(one("C11:--text-h3", { "--text-h3": 1.0625 }).message).toBe("Heading 3 and Body text are the same size (17px).");
  });
  it("C11 smart fix: you shrank Heading 1 → Heading 2 comes down; Heading 1 is left alone", () => {
    const fix = one("C11:--text-h1", { "--text-h1": 1.75 }).fix!; // user's case: H1 28px < H2 36px
    expect("--text-h1" in fix).toBe(false);
    expect("--text-body" in fix).toBe(false);
    expect((fix["--text-h2"] as number) * 16).toBeLessThan(28);
  });
  it("C11 smart fix: you enlarged Heading 2 → Heading 1 goes up", () => {
    const fix = one("C11:--text-h1", { "--text-h2": 3.75 }).fix!; // H2 60px > H1 56px
    expect(Object.keys(fix)).toEqual(["--text-h1"]);
    expect((fix["--text-h1"] as number) * 16).toBeGreaterThan(60);
  });
  it("C11 smart fix never shrinks body text", () => {
    const fix = one("C11:--text-h3", { "--text-body": 1.375, "--text-h3": 1.25 }).fix!; // body 22px > H3 20px
    expect(Object.keys(fix)).toEqual(["--text-h3"]);
    expect((fix["--text-h3"] as number) * 16).toBeGreaterThan(22);
  });
  it("C11 fixes settle in a few clicks and keep the size you chose", () => {
    let values = { ...d, "--text-h1": 1.75 } as any; // H1 28px
    let clicks = 0;
    for (; clicks < 6; clicks++) {
      const r = runChecks(full, values).find((x) => x.id.startsWith("C11"));
      if (!r) break;
      values = { ...values, ...r.fix };
    }
    expect(clicks).toBe(1); // the whole scale is repaired in one click
    expect(values["--text-h1"]).toBe(1.75);
    const px = ["--text-h1", "--text-h2", "--text-h3", "--text-body"].map((k) => values[k] * 16);
    expect(px).toEqual([...px].sort((x, y) => y - x));
    expect(new Set(px).size).toBe(4);
  });
  it("C12 adjacent sizes within 10% (info, no fix)", () => {
    const r = one("C12:--text-h2", { "--text-h2": 1.625 }); // 26px vs h3 24px
    expect(r.severity).toBe("info");
    expect(r.message).toBe("Heading 2 and Heading 3 are very close in size (26px and 24px).");
    expect(r.fix).toBeUndefined();
  });
  it("only runs a check when the tokens with its roles exist", () => {
    const bare = validSample((c) => { c.tokens = c.tokens.filter((t: any) => t.role !== "background"); });
    const v = { ...defaultValues(bare), "--color-fg": "#eeeeee", "--color-accent": "#ffffff" };
    expect(runChecks(bare, v).map((r) => r.id)).toEqual([]); // C1 and C3 need a background
  });
  it("fix values are clamped into the token's range", () => {
    const narrow = validSample((c) => { c.tokens[4].min = 70; c.tokens[4].max = 100; }); // measure 70–100
    const r = runChecks(narrow, { ...defaultValues(narrow), "--measure": 90 }).find((x) => x.id === "C6")!;
    expect(r.fix).toEqual({ "--measure": 70 });
  });
});

describe("C3 fix also protects text on the accent (user decision)", () => {
  it("white button text: the accent goes dark enough for both 3:1 on the page and 4.5:1 under white text", () => {
    const v = { ...d, "--color-accent": "#f4b08c" } as any;
    const fixed = one("C3", { "--color-accent": "#f4b08c" }).fix!["--color-accent"] as string;
    expect(contrast(fixed, "#faf8f5")).toBeGreaterThanOrEqual(3);
    expect(contrast("#ffffff", fixed)).toBeGreaterThanOrEqual(4.5);
    expect(runChecks(full, { ...v, "--color-accent": fixed }).map((r) => r.id)).toEqual([]);
  });
  it("black button text on a light page can't be protected the same way → only the accent is fixed", () => {
    const fixed = one("C3", { "--color-accent": "#f4b08c", "--color-accent-fg": "#000000" }).fix!["--color-accent"] as string;
    expect(contrast(fixed, "#faf8f5")).toBeGreaterThanOrEqual(3);
    expect(contrast(fixed, "#faf8f5")).toBeLessThan(3.3); // not pushed any further
  });
});

describe("C1 / C5 never ping-pong (regression: user-reported loop)", () => {
  const settle = (v: Record<string, unknown>) => {
    let values = { ...d, ...v } as any;
    for (let i = 0; i < 6; i++) {
      const r = runChecks(full, values).find((x) => x.id === "C1" || x.id === "C5");
      if (!r) return { values, clicks: i };
      values = { ...values, ...r.fix };
    }
    throw new Error("still flagging after 6 Fix clicks: " + JSON.stringify(values));
  };

  it("mid-grey cards: one text colour that works on both is found", () => {
    const { values, clicks } = settle({ "--color-surface": "#8a8a8a", "--color-fg": "#555555" });
    expect(clicks).toBe(1);
    expect(values["--color-surface"]).toBe("#8a8a8a"); // text changed, cards untouched
  });
  it("dark cards on a light page: C1 fixes the text, C5 adjusts the card colour, then it's done", () => {
    const v = { "--color-surface": "#404040", "--color-fg": "#777777" };
    const c5 = runChecks(full, { ...d, ...v, "--color-fg": "#1c1b1a" } as any).find((r) => r.id === "C5")!;
    expect(c5.message).toMatch(/Fix adjusts the card colour/);
    expect(Object.keys(c5.fix!)).toEqual(["--color-surface"]);
    const { clicks } = settle(v);
    expect(clicks).toBeLessThanOrEqual(2);
  });
});
