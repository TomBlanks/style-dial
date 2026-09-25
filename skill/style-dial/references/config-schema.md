# Config (`tweak.config.json`)

The config tells the panel which tokens to show, their ranges, and your suggestions.

## Location

| Project type | Location |
|---|---|
| Plain HTML | Inline in the page: `<script type="application/json" id="tweak-config">…</script>` (a separate JSON file can't be fetched when the page is opened from disk) |
| React (Vite) | `src/dev/tweak.config.json` |
| Next.js | `app/dev/tweak.config.json` |

## Schema

```ts
type Group = "Typography" | "Spacing" | "Layout" | "Colour";

type Role =
  | "body-size" | "h1-size" | "h2-size" | "h3-size" | "small-size"
  | "body-line-height" | "heading-line-height"
  | "measure" | "section-spacing" | "element-gap" | "radius"
  | "body-text" | "muted-text" | "background" | "surface"
  | "accent" | "accent-text";

interface SizeToken   { var: string; label: string; group: Group; role?: Role; type: "size"; unit: "px" | "rem" | "ch"; default: number; min: number; max: number; step: number; }
interface NumberToken { var: string; label: string; group: Group; role?: Role; type: "number"; default: number; min: number; max: number; step: number; }
interface ColorToken  { var: string; label: string; group: Group; role?: Role; type: "color"; default: string; /* "#rrggbb" */ }

interface Suggestion {
  id: string;        // kebab-case, unique
  title: string;     // max ~40 chars
  reason: string;    // one sentence, max ~120 chars
  changes: Record<string, number | string>;  // var → value: number for size/number (in the token's unit), "#rrggbb" for color
}

interface TweakConfig {
  version: 1;
  id: string;          // unique per project, e.g. "harbour-loaf" (used as the storage key)
  framework: "html" | "react-vite" | "nextjs";
  tailwind: boolean;
  tokensFile: string;  // path from the project root to where tokens live, e.g. "src/index.css"
  tokens: (SizeToken | NumberToken | ColorToken)[];
  suggestions: Suggestion[];   // 3–5
}
```

**Rules**
- `default` must equal the value in the tokens file **exactly** (same number, same unit, same hex). The panel warns in the console when they drift apart.
- Numbers are plain numbers in the token's unit: `"default": 1.0625` for `1.0625rem`, `"default": 96` for `96px`, `"default": 64` for `64ch`.
- Order tokens as you'd like them to appear; the panel groups them Typography → Spacing → Layout → Colour.
- Labels are short and plain: "Body text", "Heading 1", "Section spacing", "Text width", "Accent", "Text on accent".
- Don't include `--font-heading` / `--font-body`, and don't add a `fonts` section: fonts aren't adjustable in the panel in v1.
- `version` must be `1`. Missing or invalid `version`/`tokens` stops the panel with an error; other problems skip the bad item and warn in the console.

## Complete example (Vite + Tailwind)

```json
{
  "version": 1,
  "id": "fieldnotes-landing",
  "framework": "react-vite",
  "tailwind": true,
  "tokensFile": "src/index.css",
  "tokens": [
    { "var": "--text-body", "label": "Body text", "group": "Typography", "role": "body-size", "type": "size", "unit": "rem", "default": 1.0625, "min": 0.875, "max": 1.375, "step": 0.0625 },
    { "var": "--text-h1", "label": "Heading 1", "group": "Typography", "role": "h1-size", "type": "size", "unit": "rem", "default": 4, "min": 1.75, "max": 6, "step": 0.125 },
    { "var": "--text-h2", "label": "Heading 2", "group": "Typography", "role": "h2-size", "type": "size", "unit": "rem", "default": 2.5, "min": 1.375, "max": 4, "step": 0.125 },
    { "var": "--text-h3", "label": "Heading 3", "group": "Typography", "role": "h3-size", "type": "size", "unit": "rem", "default": 1.375, "min": 1.125, "max": 2.5, "step": 0.0625 },
    { "var": "--text-small", "label": "Small text", "group": "Typography", "role": "small-size", "type": "size", "unit": "rem", "default": 0.875, "min": 0.75, "max": 1, "step": 0.0625 },
    { "var": "--leading-body", "label": "Body line height", "group": "Typography", "role": "body-line-height", "type": "number", "default": 1.6, "min": 1.2, "max": 2.2, "step": 0.05 },
    { "var": "--leading-heading", "label": "Heading line height", "group": "Typography", "role": "heading-line-height", "type": "number", "default": 1.1, "min": 0.9, "max": 1.6, "step": 0.05 },
    { "var": "--space-section", "label": "Section spacing", "group": "Spacing", "role": "section-spacing", "type": "size", "unit": "px", "default": 112, "min": 24, "max": 200, "step": 4 },
    { "var": "--space-gap", "label": "Element gap", "group": "Spacing", "role": "element-gap", "type": "size", "unit": "px", "default": 24, "min": 4, "max": 64, "step": 2 },
    { "var": "--measure", "label": "Text width", "group": "Layout", "role": "measure", "type": "size", "unit": "ch", "default": 62, "min": 35, "max": 100, "step": 1 },
    { "var": "--radius", "label": "Corner radius", "group": "Layout", "role": "radius", "type": "size", "unit": "px", "default": 14, "min": 0, "max": 32, "step": 1 },
    { "var": "--color-fg", "label": "Text", "group": "Colour", "role": "body-text", "type": "color", "default": "#16201c" },
    { "var": "--color-muted", "label": "Muted text", "group": "Colour", "role": "muted-text", "type": "color", "default": "#55615c" },
    { "var": "--color-bg", "label": "Background", "group": "Colour", "role": "background", "type": "color", "default": "#f4f6f2" },
    { "var": "--color-surface", "label": "Card surface", "group": "Colour", "role": "surface", "type": "color", "default": "#ffffff" },
    { "var": "--color-accent", "label": "Accent", "group": "Colour", "role": "accent", "type": "color", "default": "#2f6b4f" },
    { "var": "--color-accent-fg", "label": "Text on accent", "group": "Colour", "role": "accent-text", "type": "color", "default": "#ffffff" }
  ],
  "suggestions": [
    { "id": "roomier-hero", "title": "Let the promise breathe", "reason": "A calm app deserves a slower opening: a larger headline with more air before the features.", "changes": { "--text-h1": 4.75, "--space-section": 136 } },
    { "id": "moss-accent", "title": "Deeper moss green", "reason": "A darker, more muted green reads as 'library' rather than 'fintech' for a research audience.", "changes": { "--color-accent": "#24533d" } },
    { "id": "reading-width", "title": "Book-like line length", "reason": "Researchers read long passages; a narrower measure and airier leading feel like a printed page.", "changes": { "--measure": 58, "--leading-body": 1.7 } },
    { "id": "softer-cards", "title": "Softer feature cards", "reason": "Rounder corners and wider gaps make the three features feel less like a dashboard.", "changes": { "--radius": 20, "--space-gap": 28 } }
  ]
}
```

## Checklist before you finish

- [ ] Every required token from the contract exists in the tokens file **and** in the config (except the two font tokens, which are only in the tokens file).
- [ ] Every token in the config is used by the page; changing it visibly changes something.
- [ ] Each config `default` matches the tokens file exactly; colours are 6-digit lowercase hex.
- [ ] Every `default` and every suggestion value is inside its token's `min`–`max`.
- [ ] Tailwind: tokens are in `@theme static`, not `@theme` or `@theme inline`.
- [ ] The original design passes the checks (see the end of `token-contract.md`).
- [ ] 3–5 suggestions that follow `suggestion-guide.md`.
- [ ] The panel is installed exactly as `framework-setup.md` says, inside `style-dial:start` / `style-dial:end` markers, and `tweak-panel.js` is an unmodified copy.
- [ ] Framework projects: the production build still passes.
