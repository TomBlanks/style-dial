// A complete, valid config based on the spec's Tailwind example (§4.4).
export function sampleConfig(): any {
  return {
    version: 1,
    id: "sample-site",
    framework: "html",
    tailwind: false,
    tokensFile: "tokens.css",
    tokens: [
      { var: "--text-body", label: "Body text", group: "Typography", role: "body-size", type: "size", unit: "rem", default: 1.0625, min: 0.875, max: 1.375, step: 0.0625 },
      { var: "--text-h1", label: "Heading 1", group: "Typography", role: "h1-size", type: "size", unit: "rem", default: 3.5, min: 1.75, max: 6, step: 0.125 },
      { var: "--text-h2", label: "Heading 2", group: "Typography", role: "h2-size", type: "size", unit: "rem", default: 2.25, min: 1.375, max: 4, step: 0.125 },
      { var: "--leading-body", label: "Body line height", group: "Typography", role: "body-line-height", type: "number", default: 1.6, min: 1.2, max: 2.2, step: 0.05 },
      { var: "--measure", label: "Text width", group: "Layout", role: "measure", type: "size", unit: "ch", default: 68, min: 35, max: 100, step: 1 },
      { var: "--space-section", label: "Section spacing", group: "Spacing", role: "section-spacing", type: "size", unit: "px", default: 96, min: 24, max: 200, step: 4 },
      { var: "--color-fg", label: "Text", group: "Colour", role: "body-text", type: "color", default: "#1c1b1a" },
      { var: "--color-bg", label: "Background", group: "Colour", role: "background", type: "color", default: "#faf8f5" },
      { var: "--color-accent", label: "Accent", group: "Colour", role: "accent", type: "color", default: "#c2410c" },
    ],
    suggestions: [
      { id: "bigger-hero", title: "Let the hero breathe", reason: "The studio name deserves more presence above the fold.", changes: { "--text-h1": 4, "--space-section": 112 } },
      { id: "warmer", title: "Warmer accent", reason: "A deeper terracotta suits the handmade ceramics.", changes: { "--color-accent": "#b4380a" } },
    ],
  };
}
