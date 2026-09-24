import { describe, expect, it } from "vitest";
import { validateConfig } from "../src/config/validate";
import { findStaleDefaults } from "../src/config/drift";
import { sampleConfig } from "./fixtures";

const config = (() => {
  const r = validateConfig(sampleConfig());
  if (!r.ok) throw new Error(r.error);
  return r.config;
})();

const pageValues: Record<string, string> = {
  "--text-body": "1.0625rem",
  "--text-h1": "3.5rem",
  "--text-h2": " 2.25rem",
  "--leading-body": "1.6",
  "--measure": "68ch",
  "--space-section": "96px",
  "--color-fg": "#1C1B1A",
  "--color-bg": "#faf8f5",
  "--color-accent": "#c2410c",
};

describe("findStaleDefaults", () => {
  it("reports nothing when the page matches", () => {
    expect(findStaleDefaults(config, (n) => pageValues[n] ?? "")).toEqual([]);
  });
  it("reports changed values, wrong units and missing variables", () => {
    const page = { ...pageValues, "--text-h1": "3.75rem", "--measure": "68px", "--color-accent": "#b4380a" };
    delete (page as any)["--text-h2"];
    const msgs = findStaleDefaults(config, (n) => (page as any)[n] ?? "");
    expect(msgs).toHaveLength(4);
    expect(msgs.join("\n")).toMatch(/--text-h1: config default is 3.5rem but the page has 3.75rem/);
    expect(msgs.join("\n")).toMatch(/--text-h2 is in the config but not declared/);
  });
});
