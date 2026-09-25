import { afterEach, describe, expect, it, vi } from "vitest";
import { buildExport, copyText } from "../src/export";
import { defaultValues } from "../src/state/values";
import { validSample } from "./fixtures-config";

describe("buildExport", () => {
  const config = validSample((c) => { c.tokensFile = "src/index.css"; });
  const d = defaultValues(config);

  it("matches the spec format exactly (§6.11)", () => {
    const v = { ...d, "--color-accent": "#b4380a", "--space-section": 112, "--text-h1": 3.75 };
    expect(buildExport(config, "B", v, d)).toBe(
      [
        "```style-tweaks",
        "Apply these style tweaks (style-dial v1)",
        "version: B",
        "tokens-file: src/index.css",
        "--text-h1: 3.75rem;",
        "--space-section: 112px;",
        "--color-accent: #b4380a;",
        "```",
      ].join("\n"),
    );
  });
  it("formats numbers without trailing zeros or float noise", () => {
    const v = { ...d, "--leading-body": 1.35 + 0.05, "--measure": 60 };
    const out = buildExport(config, "A", v, d);
    expect(out).toContain("--leading-body: 1.4;\n--measure: 60ch;");
  });
  it("lists nothing when the version equals the defaults", () => {
    expect(buildExport(config, "A", d, d).split("\n")).toHaveLength(5);
  });
});

describe("copyText", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses the Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect(await copyText("hi", document.body)).toBe("clipboard");
    expect(writeText).toHaveBeenCalledWith("hi");
    vi.unstubAllGlobals();
  });
  it("falls back to execCommand, and reports failure if that fails too", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    (document as any).execCommand = vi.fn().mockReturnValue(true);
    expect(await copyText("hi", document.body)).toBe("fallback");
    (document as any).execCommand = vi.fn().mockReturnValue(false);
    expect(await copyText("hi", document.body)).toBe("failed");
    expect(document.querySelector("textarea")).toBeNull(); // cleaned up
    vi.unstubAllGlobals();
  });
});
