import { afterEach, describe, expect, it } from "vitest";
import { OverrideWriter, STYLE_ID, buildOverrideCss } from "../src/overrides";
import { defaultValues } from "../src/state/values";
import { validSample } from "./fixtures-config";

describe("buildOverrideCss", () => {
  const config = validSample();
  const d = defaultValues(config);

  it("is empty when nothing differs", () => {
    expect(buildOverrideCss(config, d, d)).toBe("");
  });
  it("lists only overridden tokens, in config order, with units", () => {
    const v = { ...d, "--color-accent": "#b4380a", "--text-h1": 3.75, "--space-section": 112, "--leading-body": 1.4 + 0.05, "--measure": 60 };
    expect(buildOverrideCss(config, v, d)).toBe(
      [
        ":root {",
        "  --text-h1: 3.75rem;",
        "  --leading-body: 1.45;",
        "  --measure: 60ch;",
        "  --space-section: 112px;",
        "  --color-accent: #b4380a;",
        "}",
      ].join("\n"),
    );
  });
});

describe("OverrideWriter", () => {
  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("creates one style element at the end of <head> and batches writes", () => {
    document.head.innerHTML = "<style>:root{--a:1}</style>";
    const w = new OverrideWriter();
    w.write(":root { --x: 1px; }");
    w.write(":root { --x: 2px; }");
    expect(document.getElementById(STYLE_ID)).toBeNull(); // not until the frame
    w.flush();
    const el = document.getElementById(STYLE_ID)!;
    expect(el.textContent).toBe(":root { --x: 2px; }");
    expect(document.head.lastElementChild).toBe(el);
    expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
  });
  it("writes on the next animation frame", async () => {
    const w = new OverrideWriter();
    w.write(":root { --x: 3px; }");
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(document.getElementById(STYLE_ID)?.textContent).toBe(":root { --x: 3px; }");
  });
  it("moves itself back to the end of <head> if something was added after it", () => {
    const w = new OverrideWriter();
    w.write(":root{--a:1}");
    w.flush();
    document.head.appendChild(document.createElement("style"));
    w.write(":root{--b:1}");
    w.flush();
    expect(document.head.lastElementChild?.id).toBe(STYLE_ID);
  });
  it("empties to an empty string and removes cleanly", () => {
    const w = new OverrideWriter();
    w.write(":root{--a:1}");
    w.flush();
    w.write("");
    w.flush();
    expect(document.getElementById(STYLE_ID)?.textContent).toBe("");
    w.remove();
    expect(document.getElementById(STYLE_ID)).toBeNull();
  });
  it("never touches <html> inline styles", () => {
    const w = new OverrideWriter();
    w.write(":root { --x: 1px; }");
    w.flush();
    expect(document.documentElement.getAttribute("style")).toBeNull();
  });
});
