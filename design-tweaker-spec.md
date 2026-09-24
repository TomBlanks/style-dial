# Design Tweaker — v1 Specification

*Working title. Version 1.1 of this spec. Changes since 1.0: version flicking (Original · A · B · C) replaces the Before/After toggle; side-by-side comparison added to the roadmap.*

---

## 0. Instructions for Claude Code

You are building the v1 of this project from scratch. Before writing code:

1. Read this entire document. Section 13 (Roadmap) lists features that are **out of scope** — do not implement them, even partially.
2. Work through the milestones in Section 12 in order. Finish and test each one before starting the next.
3. Write unit tests alongside the code, not afterwards.
4. If something in this spec is ambiguous or seems wrong, stop and ask rather than guessing. Record any decision you make in `DECISIONS.md` at the repo root.
5. Keep the panel dependency-free at runtime. Dev dependencies (TypeScript, esbuild, Vitest, Playwright) are fine.

---

## 1. Overview

Design Tweaker is two things that work together:

- **The panel**: a small floating control box that appears in the bottom-right corner of a website during development. It shows sliders, colour pickers and font options for the site's design tokens, runs design checks, shows design suggestions, lets the user try alternative versions and flick between them, and lets the user copy their changes.
- **The skill**: a Claude Code skill that makes Claude build every website on a strict *token contract*, write a config describing those tokens (including tailored suggestions), install the panel in development mode, and later apply the user's copied changes back into the code.

### The problem it solves

Fine-tuning an AI-generated site through chat is slow ("make the heading a bit bigger… no, smaller"). The panel turns those small visual adjustments into direct manipulation, then hands the result back to Claude in a precise format.

### User flow

1. User asks Claude Code to build a website. The skill triggers.
2. Claude builds the site with all adjustable values as CSS variables in one tokens location, writes `tweak.config.json`, and installs the panel (dev only).
3. User runs the dev server. The panel appears bottom-right.
4. User adjusts controls, reviews checks, previews and applies suggestions, uses undo/redo, and can create alternative versions to flick between (and compare against the original).
5. User clicks **Copy changes**, pastes into Claude Code.
6. Claude updates the token values in the source and updates the config defaults.
7. When finished, the user says the design is final; Claude removes the panel and config.

### v1 goals

- Works in Claude Code projects using plain HTML/CSS, React (Vite), or Next.js (App Router), each with or without Tailwind CSS v4.
- Panel never appears in production builds (framework projects).
- Reliable round trip: panel → copied text → Claude → source code.

### v1 non-goals

- Writing changes directly to files from the browser.
- Claude.ai chat / artifact support.
- Tailwind v3.
- Layout changes, drag-to-reorder sections, or editing HTML structure.
- Anything in Section 13.

---

## 2. Glossary

| Term | Meaning |
|---|---|
| **Token** | A CSS custom property (e.g. `--text-body`) that controls one adjustable design value. |
| **Token contract** | The rules Claude follows so every adjustable value is a token (Section 4). |
| **Config** | `tweak.config.json` — describes each token, font options and suggestions for the panel (Section 5). |
| **Default** | A token's value as currently written in the source code. |
| **Override** | A value the user has set in the panel that differs from the default. |
| **Version** | One complete set of token values the user is working on (A, B or C). The **Original** view shows the defaults and can't be edited. |
| **Role** | A label saying what a token is for (e.g. `body-text`), used by the checks. |
| **Check** | A rule-based design warning (Section 7). |
| **Suggestion** | A Claude-written, named set of token changes tailored to the design (Section 8). |

---

## 3. Repository structure

```
design-tweaker/
├── README.md
├── DECISIONS.md
├── panel/
│   ├── package.json
│   ├── tsconfig.json
│   ├── build.mjs                 # esbuild → single IIFE file
│   ├── src/
│   │   ├── index.ts              # entry: exposes window.TweakPanel, auto-mount
│   │   ├── config/               # schema types + validation
│   │   ├── state/                # store, history, persistence
│   │   ├── overrides.ts          # writes the override <style> element
│   │   ├── checks/               # contrast maths + rules
│   │   ├── export.ts             # "Copy changes" text
│   │   ├── fonts.ts              # font loading for options
│   │   └── ui/                   # Shadow DOM UI components
│   └── tests/                    # Vitest unit tests
├── skill/
│   └── design-tweaker/
│       ├── SKILL.md
│       ├── assets/
│       │   ├── tweak-panel.js     # built output, copied here by the build
│       │   └── tweak-panel.d.ts   # types for TS projects
│       └── references/
│           ├── token-contract.md
│           ├── config-schema.md
│           ├── suggestion-guide.md
│           ├── font-pairs.md
│           ├── framework-setup.md
│           └── applying-and-finalising.md
├── examples/
│   ├── plain-html/
│   ├── react-vite-tailwind/
│   └── nextjs-tailwind/
└── e2e/                          # Playwright tests against the examples
```

The build script must copy `panel/dist/tweak-panel.js` into `skill/design-tweaker/assets/` so the skill always ships the latest panel.

---

## 4. Token contract

This is the core of the project. Every site built with the skill must follow it.

### 4.1 Rules

1. Every adjustable design value is a CSS custom property. Components never hard-code these values.
2. All tokens are declared in **one location** per project (see 4.3).
3. Token names follow the naming scheme in 4.2 in every project, Tailwind or not. This keeps the skill, panel and checks consistent.
4. Colour token values are 6-digit hex (`#1a1a1a`) in v1. No `rgb()`, `hsl()`, `oklch()` or named colours for tokens.
5. Font-size tokens use `rem`. Spacing tokens use `px` or `rem`. Text width uses `ch`. Line height is unitless.
6. A site defines roughly 12–25 tokens. Too few makes the panel useless; too many makes it overwhelming.

### 4.2 Naming scheme and roles

The names are chosen to match Tailwind v4's theme namespaces, so they also generate Tailwind utilities (e.g. `--color-accent` → `bg-accent`).

| Token | Role | Type | Required |
|---|---|---|---|
| `--text-body` | `body-size` | size (rem) | ✅ |
| `--text-h1` | `h1-size` | size (rem) | ✅ |
| `--text-h2` | `h2-size` | size (rem) | ✅ |
| `--text-h3` | `h3-size` | size (rem) | if h3 used |
| `--text-small` | `small-size` | size (rem) | optional |
| `--leading-body` | `body-line-height` | number | ✅ |
| `--leading-heading` | `heading-line-height` | number | optional |
| `--measure` | `measure` | size (ch) | ✅ |
| `--space-section` | `section-spacing` | size | ✅ |
| `--space-gap` | `element-gap` | size | optional |
| `--radius` | `radius` | size | optional |
| `--color-fg` | `body-text` | color | ✅ |
| `--color-muted` | `muted-text` | color | optional |
| `--color-bg` | `background` | color | ✅ |
| `--color-surface` | `surface` | color | optional |
| `--color-accent` | `accent` | color | ✅ |
| `--color-accent-fg` | `accent-text` | color | optional (text on accent) |
| `--font-heading` | *(font pair)* | font | ✅ |
| `--font-body` | *(font pair)* | font | ✅ |

Claude may add extra tokens (e.g. `--space-card`) without a role. Extra tokens get sliders but aren't used by checks.

### 4.3 Where tokens live

| Project type | Location |
|---|---|
| Plain HTML/CSS | `tokens.css`, linked first in `<head>`, one `:root { … }` block |
| React / Next.js, no Tailwind | `src/styles/tokens.css` (or `app/tokens.css`), imported once at the app root, one `:root { … }` block |
| Tailwind v4 | A single `@theme { … }` block in the main CSS file (e.g. `src/index.css`, `app/globals.css`) |

**Tailwind rules:**
- Use `@theme`, **not** `@theme inline`, for tweakable tokens. `inline` bakes values into utilities, so runtime changes would have no effect.
- Tokens outside Tailwind's namespaces (`--measure`, `--space-*`) are declared in the same `@theme` block and used with the variable shorthand syntax, e.g. `max-w-(--measure)`, `py-(--space-section)`.

### 4.4 Example (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  --font-heading: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  --text-body: 1.0625rem;
  --text-h1: 3.5rem;
  --text-h2: 2.25rem;
  --text-h3: 1.5rem;
  --leading-body: 1.6;

  --measure: 68ch;
  --space-section: 96px;
  --space-gap: 24px;
  --radius: 12px;

  --color-fg: #1c1b1a;
  --color-muted: #5f5b57;
  --color-bg: #faf8f5;
  --color-surface: #ffffff;
  --color-accent: #c2410c;
  --color-accent-fg: #ffffff;
}
```

---

## 5. Config (`tweak.config.json`)

### 5.1 Location

| Project type | Location |
|---|---|
| Plain HTML | Inline in the page: `<script type="application/json" id="tweak-config">…</script>` (fetching a local JSON file fails when the page is opened as `file://`) |
| React (Vite) | `src/dev/tweak.config.json` |
| Next.js | `app/dev/tweak.config.json` |

### 5.2 Schema

The panel must validate the config on load (see 5.3). TypeScript types:

```ts
type Group = "Typography" | "Spacing" | "Layout" | "Colour";

type Role =
  | "body-size" | "h1-size" | "h2-size" | "h3-size" | "small-size"
  | "body-line-height" | "heading-line-height"
  | "measure" | "section-spacing" | "element-gap" | "radius"
  | "body-text" | "muted-text" | "background" | "surface"
  | "accent" | "accent-text";

interface BaseToken {
  var: string;            // e.g. "--text-body"; must start with "--"
  label: string;          // shown in panel, e.g. "Body text"
  group: Group;
  role?: Role;
}

interface SizeToken extends BaseToken {
  type: "size";
  unit: "px" | "rem" | "ch";
  default: number;        // e.g. 1.0625
  min: number;
  max: number;
  step: number;           // rem font sizes: 0.0625 (= 1px)
}

interface NumberToken extends BaseToken {
  type: "number";         // unitless, e.g. line-height
  default: number;
  min: number;
  max: number;
  step: number;
}

interface ColorToken extends BaseToken {
  type: "color";
  default: string;        // "#rrggbb"
}

type Token = SizeToken | NumberToken | ColorToken;

interface FontSpec {
  family: string;         // e.g. "Fraunces"; "system-ui" for system option
  fallback: string;       // e.g. "Georgia, serif"
  source: "google" | "system";
  weights?: number[];     // google only, e.g. [400, 600, 700]
}

interface FontPair {
  id: string;             // e.g. "editorial"
  name: string;           // e.g. "Editorial" — never a company or brand name
  heading: FontSpec;
  body: FontSpec;
}

interface FontControl {
  headingVar: "--font-heading";
  bodyVar: "--font-body";
  default: string;        // FontPair id currently in the source
  options: FontPair[];    // 4–6 options; first is always the System option
}

interface Suggestion {
  id: string;
  title: string;          // max ~40 chars
  reason: string;         // one sentence, max ~120 chars
  changes: Record<string, number | string>;  // var → value (number for size/number, hex for color)
  fontPair?: string;      // optional FontPair id
}

interface TweakConfig {
  version: 1;
  id: string;             // unique project id, used for storage key
  framework: "html" | "react-vite" | "nextjs";
  tailwind: boolean;
  tokensFile: string;     // relative path to where tokens live
  tokens: Token[];
  fonts: FontControl;
  suggestions: Suggestion[];   // 3–5
}
```

### 5.3 Validation

On load the panel validates the config. Behaviour:

- **Fatal** (panel shows an error state with the message, no controls): invalid JSON, missing `version`/`tokens`, `version !== 1`.
- **Non-fatal** (item skipped, `console.warn` with details, panel still works): a token with a bad `var`, a non-hex colour, `min > max`, a default outside `[min, max]` (clamp and warn), a suggestion referencing an unknown token or font pair, suggestion values outside range (clamp and warn).
- The panel also compares each token's `default` against the computed value on `:root` at mount. If they differ, it warns in the console that the config is out of date. The config remains the source of truth.

---

## 6. The panel

### 6.1 Distribution and mounting

- Built as a single IIFE file, `tweak-panel.js`, with no runtime dependencies. Target: under 30 KB gzipped.
- On load it defines `window.TweakPanel = { mount(config), unmount() }`.
- If the page contains `<script type="application/json" id="tweak-config">`, it auto-mounts using that config (plain HTML path).
- Calling `mount` twice is a no-op with a console warning.
- `tweak-panel.d.ts` declares the global for TypeScript projects.

### 6.2 Isolation

- The panel UI lives inside a **Shadow DOM** attached to a host element (`<design-tweaker-root>`) appended to `<body>`. Site CSS must not affect the panel, and panel CSS must not affect the site.
- Host element: `position: fixed; z-index: 2147483000;`.
- The panel uses its own system font stack and its own neutral colour scheme (light/dark following `prefers-color-scheme`), independent of the site's tokens.

### 6.3 How overrides are applied

- The panel creates one element: `<style id="design-tweaker-overrides">` appended at the end of `<head>`, containing a single unlayered `:root { … }` rule with only the overridden tokens.
- Unlayered styles win over Tailwind's layered `@theme` output and match the specificity of a plain `:root` block while coming later, so overrides always take effect.
- The panel never modifies `<html>` inline styles or any site element.
- Updates during slider drags are batched with `requestAnimationFrame`.

### 6.4 Layout

**Collapsed state**
- A 44×44px round button, 16px from the bottom-right corner, with a sliders icon.
- Shows a small badge with the number of unsaved changes when > 0.
- Click or `Alt+Shift+T` opens the panel.

**Expanded state**
- 340px wide, max-height 70vh, anchored bottom-right, 16px margins.
- Header: title "Design Tweaker", a collapse button.
- Version bar directly below the header (see 6.10).
- Tabs: **Controls**, **Checks** (with count badge of warnings), **Suggestions**.
- Scrollable body.
- Sticky footer (see 6.8).
- The collapsed/expanded state and active tab are remembered (Section 9).
- On viewports under 480px wide, the expanded panel is full width with 8px margins.

### 6.5 Controls tab

Controls are grouped by `group` in this order: Typography, Spacing, Layout, Colour. Each group is a collapsible section (all open by default).

**Font pair control** (top of Typography)
- A vertical list of the font pairs. Each option shows its name and the heading font's family rendered in the heading font, with a sample line ("The quick brown fox") in the body font.
- The selected option is highlighted. Clicking an option sets both `--font-heading` and `--font-body`.
- The value written for each variable is `"<family>", <fallback>` (system option: just the fallback stack, e.g. `system-ui, -apple-system, "Segoe UI", sans-serif`).
- When the panel mounts, it loads all Google font options with a single Google Fonts CSS request (`<link>` in `<head>`, `display=swap`). The System option loads nothing.

**Size / number control**
- Label on the left; value on the right as an editable number input with unit suffix.
- Slider below, using `min`, `max`, `step`.
- For `rem` tokens, show a secondary px readout (value × 16) in muted text, e.g. `1.0625rem · 17px`.
- A small reset icon appears when the value differs from the default; clicking it resets that token only.
- Typing a value outside the range clamps it on blur.

**Colour control**
- Label; a swatch that opens the native `<input type="color">`; an editable hex text input.
- Invalid hex text is rejected on blur (reverts to the last valid value).
- Per-token reset icon, as above.

### 6.6 Checks tab

Shows the results of the rule checks (Section 7) as a list. Each item has:
- A severity icon (warning or info).
- A one-line message in plain English.
- A **Fix** button where the rule defines a fix. Applying a fix is one history entry.

If there are no issues, show "No issues found." The tab's badge shows the number of warnings (not info items).

### 6.7 Suggestions tab

Shows each suggestion from the config as a card:
- Title (bold) and reason (muted).
- A short summary of what changes, e.g. "Heading size, section spacing".
- **Preview** button: temporarily applies the suggestion on top of the current values. The button becomes **Stop preview**. Only one suggestion can be previewed at a time. Preview is not recorded in history and not persisted. Leaving the tab, clicking another control, switching version, or pressing Escape ends the preview.
- **Apply** button: applies the suggestion as one history entry. The card then shows "Applied" and dims.
- If the current values already match all of a suggestion's changes, it shows as "Applied".

### 6.8 Footer

Left to right:
- **Undo** and **Redo** icon buttons (disabled when unavailable).
- **Reset all** (asks for confirmation inline: "Reset this version to the original?" Yes / Cancel). Affects the active version only.
- **Copy changes**, the primary button, bottom right. Copies the active version. Disabled when the active version has no changes or when Original is showing. Above it, muted text: "Version B · N unsaved changes".

### 6.9 History (undo / redo)

- Each version has its **own** history: a list of snapshots of that version's token values (including the font pair). Undo in Version B never affects Version A.
- A slider drag creates **one** entry, committed on pointer release, not per movement. Typing a value commits on blur or Enter. A colour picker commits when the picker closes / on `change`.
- Fixes, suggestion applies, per-token resets and Reset all are each one entry.
- Maximum 100 entries per version; the oldest are dropped.
- Switching version is not a history entry. Undo/Redo are disabled while Original is showing.
- Keyboard: `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` redo, only when focus is inside the panel.
- History is kept in memory only (not persisted across reloads).

### 6.10 Versions

Lets the user try alternative designs and flick between them instantly. Versions only differ in token values, so switching just swaps the contents of the override style element (6.3); nothing is reloaded or duplicated.

**Version bar** (below the header, above the tabs)
- Segmented tabs: **Original · A** to start, growing to **Original · A · B · C**.
- A **+ Try a new version** button to the right of the tabs. It creates the next version as a copy of the **active** version's current values and switches to it. Hidden once three versions exist.
- The active tab is highlighted. Each version tab shows a small dot when it has changes compared to the defaults.
- Each version tab (except when it's the only one) has a small ✕ to delete it, with inline confirmation ("Delete Version B?"). Remaining versions keep their letters; a new version takes the first free letter.

**Behaviour**
- **Version A** always exists and starts equal to the defaults.
- Maximum three versions (A, B, C) in v1.
- **Original** shows the defaults: the override style element is emptied, all controls are disabled, and a banner reads "Showing original design — pick a version to edit". Checks and Suggestions tabs show results for the original values; suggestion Preview/Apply buttons are disabled.
- Switching version ends any active suggestion preview.
- Controls, checks, the suggestions' "Applied" states and the unsaved-changes count always reflect the active version.
- Keyboard (when focus is inside the panel): `Alt+Shift+0` Original, `Alt+Shift+1/2/3` Version A/B/C.
- Versions persist across reloads (Section 9).

### 6.11 Copy changes

Clicking **Copy changes** copies text in exactly this format:

````
```design-tweaks
Apply these design tweaks (design-tweaker v1)
version: B
tokens-file: src/index.css
--text-h1: 3.75rem;
--space-section: 112px;
--color-accent: #b4380a;
fonts: editorial
```
````

Rules:
- Exports the **active version** only. The `version:` line is informational; Claude doesn't need it to apply the changes.
- Only tokens whose values differ from their defaults are listed, in config order.
- The `fonts:` line appears only if the font pair changed; its value is the FontPair `id`.
- Numbers are formatted without trailing zeros (e.g. `1.6`, not `1.600`).
- Uses the Clipboard API; falls back to a hidden textarea + `document.execCommand("copy")`. If both fail, show the text in a selectable box with "Copy this manually".
- On success, show a toast "Copied — paste it into Claude Code" for 3 seconds.
- Copying does **not** clear the changes. They clear automatically once Claude updates the defaults (Section 9).

### 6.12 Accessibility of the panel

- Every control has an accessible label. Sliders use native `<input type="range">`.
- Fully keyboard operable; visible focus styles; tabs follow the WAI-ARIA tabs pattern.
- The panel's own text meets WCAG AA contrast.
- Respects `prefers-reduced-motion` (no animations).
- Toasts use `aria-live="polite"`.

---

## 7. Checks (rule-based suggestions)

Checks run against the active version (or the defaults when Original is showing) and re-run after every change or version switch, debounced to 100ms. A check only runs if the tokens with the roles it needs exist. Sizes are converted to px for comparisons (rem × 16).

| ID | Check | Severity | Condition | Fix |
|---|---|---|---|---|
| C1 | Body text contrast | warning | contrast(`body-text`, `background`) < 4.5 | Adjust `body-text` lightness to the nearest value reaching 4.5:1 |
| C2 | Muted text contrast | warning | contrast(`muted-text`, `background`) < 4.5 | Same method on `muted-text` |
| C3 | Accent visibility | warning | contrast(`accent`, `background`) < 3.0 | Adjust `accent` lightness to reach 3.0:1 |
| C4 | Text on accent | warning | contrast(`accent-text`, `accent`) < 4.5 | Set `accent-text` to `#ffffff` or `#000000`, whichever contrasts more |
| C5 | Surface text contrast | warning | contrast(`body-text`, `surface`) < 4.5 | Same method as C1 applied to `body-text` |
| C6 | Lines too long | warning | `measure` > 75ch | Set `measure` to 68ch |
| C7 | Lines very short | info | `measure` < 45ch | Set `measure` to 60ch |
| C8 | Body text too small | warning | `body-size` < 16px | Set to 16px (1rem) |
| C9 | Body line height tight | warning | `body-line-height` < 1.4 | Set to 1.5 |
| C10 | Body line height loose | info | `body-line-height` > 2.0 | Set to 1.7 |
| C11 | Heading hierarchy | warning | not (h1 > h2 > h3 > body) for defined roles | No fix; message names which pair is out of order |
| C12 | Headings too close | info | any adjacent pair in h1/h2/h3/body differs by less than 10% | No fix |

**Contrast maths**: use the WCAG 2.x relative luminance and contrast ratio formulas.

**Lightness fix method**: convert the colour to OKLCH, keep hue and chroma, and search lightness in the direction away from the background (darker on light backgrounds, lighter on dark ones) for the closest value that meets the target ratio. Clamp chroma into sRGB gamut and output `#rrggbb`. If no value works, fall back to `#000000` or `#ffffff`.

Messages are plain English, e.g. *"Body text is hard to read on this background (3.2:1, needs 4.5:1)."*

---

## 8. Claude-written suggestions

Suggestions are written by Claude when it builds (or rebuilds) the site and stored in the config. There are no AI calls at runtime.

Requirements (enforced by the skill's `suggestion-guide.md`):
- 3–5 suggestions per site.
- Each is specific to this design and its purpose (e.g. mentions the brand, audience or section), not generic advice.
- Each changes 1–3 tokens, and/or the font pair.
- Never duplicate what a check already covers (e.g. no "increase contrast" suggestions).
- All values must be within the tokens' ranges.
- Aim for variety: e.g. one typography, one spacing/rhythm, one colour, one font pairing.
- After Claude applies a round of tweaks, it refreshes the suggestions so they fit the updated design.

---

## 9. Persistence

Tweaks survive a page refresh using `localStorage`. All storage access is wrapped in `try/catch`; if storage is unavailable, the panel works without persistence.

**Key**: `design-tweaker:v1:<config.id>`

**Stored value**: each version is stored as a **complete** set of values (every token plus the font pair), together with the defaults they were last reconciled against.

```json
{
  "baseDefaults": {
    "--text-h1": 3.5,
    "--color-accent": "#c2410c",
    "fontPair": "modern"
  },
  "versions": {
    "A": { "--text-h1": 3.5,  "--color-accent": "#c2410c", "fontPair": "modern" },
    "B": { "--text-h1": 3.75, "--color-accent": "#b4380a", "fontPair": "editorial" }
  },
  "ui": { "expanded": true, "tab": "controls", "active": "B" }
}
```

*(Values abbreviated; real entries contain every token.)*

**Reconciliation on load** (this is what makes the round trip feel automatic). Compare the config's current defaults against the stored `baseDefaults`, token by token (treat the font pair as a token):

- **Token removed from the config** → remove it from every version.
- **Token added to the config** → add it to every version with its new default.
- **Default unchanged** → keep every version's value as it is.
- **Default changed, and at least one version's value equals the new default** → the user applied that version through Claude. Keep all versions' values as they are. (The applied version now matches the code; the other versions remain as deliberate alternatives.)
- **Default changed, and no version has that value** → the code was changed some other way. The source wins: set that token to the new default in every version.

Then set `baseDefaults` to the config's current defaults and write the result back to storage. If the stored active version no longer exists, show Version A.

Unsaved-change counts are always calculated as the difference between a version and the current defaults, so after Claude applies Version B and the page reloads, Version B shows 0 changes automatically.

Storage is updated (debounced 300ms) whenever the committed state of any version, or the list of versions, changes. History is not stored.

---

## 10. Framework setup

This is what the skill instructs Claude to do in each project type. The full instructions go in `references/framework-setup.md`.

### 10.1 Plain HTML/CSS

- Tokens in `tokens.css`, linked first in `<head>`.
- Copy `tweak-panel.js` into the project root (or `dev/`).
- At the end of `<body>`:
  ```html
  <!-- design-tweaker:start -->
  <script type="application/json" id="tweak-config">{ … }</script>
  <script src="tweak-panel.js"></script>
  <!-- design-tweaker:end -->
  ```
- There's no dev/production distinction, so the panel stays until the user finalises (10.4). The comment markers make removal reliable.

### 10.2 React (Vite)

- Copy `tweak-panel.js` and `tweak-panel.d.ts` into `src/dev/`; write `src/dev/tweak.config.json`.
- In `src/main.tsx` (after rendering the app):
  ```ts
  // design-tweaker:start
  if (import.meta.env.DEV) {
    Promise.all([
      import("./dev/tweak-panel.js"),
      import("./dev/tweak.config.json"),
    ]).then(([, config]) => window.TweakPanel.mount(config.default));
  }
  // design-tweaker:end
  ```
- Vite removes this block from production builds, so the panel never ships.

### 10.3 Next.js (App Router)

- Copy `tweak-panel.js` and `tweak-panel.d.ts` into `app/dev/`; write `app/dev/tweak.config.json`.
- Create `app/dev/DevTweakPanel.tsx`:
  ```tsx
  "use client";
  import { useEffect } from "react";
  export default function DevTweakPanel() {
    useEffect(() => {
      Promise.all([import("./tweak-panel.js"), import("./tweak.config.json")])
        .then(([, config]) => window.TweakPanel.mount(config.default));
      return () => window.TweakPanel?.unmount();
    }, []);
    return null;
  }
  ```
- In `app/layout.tsx`, inside `<body>`:
  ```tsx
  {/* design-tweaker:start */}
  {process.env.NODE_ENV === "development" && <DevTweakPanel />}
  {/* design-tweaker:end */}
  ```
- The panel mounts after hydration, outside the React tree, so it causes no hydration mismatches.

### 10.4 Fonts in real projects

The panel loads font options itself in development. Once a font pair is chosen and applied, Claude sets up proper font loading for that pair only:
- Plain HTML / Vite: a Google Fonts `<link>` in `<head>` (or `@fontsource` packages if the project already uses them).
- Next.js: `next/font/google`, wired to `--font-heading` / `--font-body`.

### 10.5 Finalising

When the user says the design is final, Claude:
1. Removes everything between `design-tweaker:start` / `design-tweaker:end` markers.
2. Deletes the copied panel files and the config.
3. Keeps the tokens (they're good practice anyway).
4. Confirms the production build still passes.

---

## 11. The skill

### 11.1 `SKILL.md` (full draft)

```markdown
---
name: design-tweaker
description: Builds websites on a design-token contract and installs a live
  tweak panel (sliders, colour pickers, font pairs, design checks and tailored
  suggestions) for fine-tuning during development. Use whenever the user asks
  to design, build, restyle or mock up a website, landing page, portfolio or
  web UI in plain HTML/CSS, React (Vite) or Next.js, even if they don't mention
  a panel. Also use whenever the user pastes a block starting with
  "Apply these design tweaks (design-tweaker v1)", or says the design is final.
---

# Design Tweaker

## When building or restyling a site
1. Detect the project type: plain HTML, React (Vite) or Next.js, and whether
   it uses Tailwind v4. If it uses Tailwind v3, tell the user v1 doesn't
   support it and ask whether to continue without the panel.
2. Read references/token-contract.md. Build the site so every adjustable
   value is a token, using the exact names and roles listed there.
3. Read references/font-pairs.md. Choose 4–6 font pairs that suit this site.
   The first option is always System. Never name companies or brands.
4. Read references/suggestion-guide.md. Write 3–5 suggestions for this design.
5. Read references/config-schema.md and write the config.
6. Read references/framework-setup.md and install the panel for this project
   type. Copy assets/tweak-panel.js exactly. Never rewrite or edit it.
7. Tell the user in one or two sentences how to open the panel and that
   "Copy changes" gives them text to paste back here.

## When the user pastes "Apply these design tweaks (design-tweaker v1)"
Follow references/applying-and-finalising.md: update only the listed token
values in the tokens file, update the matching config defaults, handle any
font change, then refresh the suggestions.

## When the user says the design is final
Follow the finalising steps in references/applying-and-finalising.md.
```

### 11.2 Reference files

| File | Contents |
|---|---|
| `token-contract.md` | Section 4 of this spec, plus good/bad examples of hard-coded vs tokenised values, and recommended ranges for each role (below). |
| `config-schema.md` | Section 5, plus one complete valid example config. |
| `suggestion-guide.md` | Section 8, plus 3 good and 3 bad example suggestions with explanations. |
| `font-pairs.md` | How to pick pairs; a starter list of ~15 openly licensed Google Fonts pairs with suitable fallbacks and weights; the System option definition; the rule that no company or brand names are used. |
| `framework-setup.md` | Section 10.1–10.4 in full. |
| `applying-and-finalising.md` | How to parse the `design-tweaks` block (the `version:` line can be ignored); update tokens and config defaults; switch fonts (update variables and font loading, remove unused font imports); refresh suggestions; Section 10.5. Also: if the pasted `tokens-file` doesn't match the project, ask the user. |

**Recommended ranges** (for `token-contract.md`):

| Role | min | max | step |
|---|---|---|---|
| body-size | 0.875rem | 1.375rem | 0.0625 |
| h1-size | 1.75rem | 6rem | 0.125 |
| h2-size | 1.375rem | 4rem | 0.125 |
| h3-size | 1.125rem | 2.5rem | 0.0625 |
| body-line-height | 1.2 | 2.2 | 0.05 |
| measure | 35ch | 100ch | 1 |
| section-spacing | 24px | 200px | 4 |
| element-gap | 4px | 64px | 2 |
| radius | 0px | 32px | 1 |

---

## 12. Milestones

**M1 — Panel core**
- Project setup (TypeScript, esbuild IIFE build, Vitest).
- Config types and validation (5.2, 5.3).
- State store, override style element (6.3).
- Shadow DOM shell, collapsed/expanded states, tabs (6.2, 6.4).
- Size, number and colour controls (6.5).
- Tests: validation, override output, value formatting.
- Manual check with `examples/plain-html`.

**M2 — History, versions, export, persistence**
- History (6.9), Reset all, per-token reset.
- Versions: version bar, Try a new version, delete, Original view, keyboard shortcuts (6.10).
- Copy changes (6.11).
- Persistence and reconciliation (Section 9).
- Tests: per-version history isolation, new version copies the active one, deleting and re-creating versions, export of the active version, every reconciliation case (including "applied B while A differs" and "code changed outside the panel").

**M3 — Checks**
- Contrast maths, OKLCH lightness fix, checks C1–C12 (Section 7), Checks tab.
- Tests: known contrast values, each check's trigger and fix.

**M4 — Fonts and suggestions**
- Font pair control and font loading (6.5).
- Suggestions tab with preview/apply (6.7).
- Tests: preview never enters history, apply is one entry, "Applied" detection.

**M5 — Framework examples and e2e**
- `examples/react-vite-tailwind` and `examples/nextjs-tailwind` set up exactly as in Section 10.
- Playwright tests: panel mounts in dev; is absent from production builds; slider changes the page; copy output is correct; reload keeps tweaks; updating the config default clears the matching override.

**M6 — Skill**
- Write `SKILL.md` and all reference files.
- Test by asking Claude Code (with the skill installed) to build at least four sites: plain HTML portfolio, Vite + Tailwind landing page, Next.js + Tailwind small business site, and a restyle of an existing site. For each, check the result against the acceptance criteria below and refine the skill.

### Acceptance criteria for v1

- [ ] Panel mounts in all three example projects and is absent from Vite and Next.js production builds.
- [ ] Every required token (4.2) exists and is used by the site; changing each one visibly changes the page.
- [ ] No site CSS leaks into the panel and vice versa.
- [ ] Undo/redo, reset and per-token reset all work as specified, per version.
- [ ] Up to three versions can be created, switched instantly, deleted, and survive a reload; Original shows the defaults with controls disabled.
- [ ] After applying Version B through Claude and reloading, B shows 0 changes and A keeps its own values.
- [ ] Copy changes produces exactly the format in 6.11.
- [ ] After pasting into Claude Code and reloading, applied overrides disappear and the badge shows 0.
- [ ] All checks trigger and fix as specified.
- [ ] Suggestions are specific to the site, preview correctly and apply as one history entry.
- [ ] Font pairs switch instantly; no company or brand names appear anywhere.
- [ ] Panel is keyboard operable and meets WCAG AA contrast itself.
- [ ] Bundle is under 30 KB gzipped.

---

## 13. Roadmap (out of scope for v1)

**Next (v2 candidates)**
- **Apply directly to files**: an "Apply" button that writes to the tokens file, via Chrome's File System Access API and/or a small local companion server (`npx design-tweaker`). The token contract makes this a single-block replacement.
- **Side-by-side compare**: show two versions at once in split panes. Each pane is an iframe of the same dev server URL with its own overrides, rendered at full desktop width and scaled down so both show the desktop layout. Needs scroll syncing between panes and a local server for plain HTML sites. Shares the scaled-iframe technique with Device preview, so build them together.
- **More than three versions**, and renaming versions.
- **Inspect mode**: click an element to highlight the tokens that affect it.
- **Pinned notes**: attach a written note to an element; included in the export for Claude to act on.

**Later / possible Pro features**
- **Device preview**: phone / tablet / desktop width preview inside the panel.
- **Accessibility views**: colour-blindness simulations.
- **Share link**: encode tweaks in the URL for feedback from others.
- **Preset vibes**: one-click presets (Compact, Airy, Editorial, Bold, Minimal).
- **Mix-and-match fonts**: choose heading and body fonts independently.
- **Multi-format export**: Tailwind config, design-tokens JSON.
- **Design system as a skill**: export the tuned tokens and fonts as a personal skill so future sites start in the user's style.
- **Platform support**: Claude.ai chat artifacts, Tailwind v3, Vue/Svelte/Astro.
- **Standalone npm package** for use in any project without the skill.
- **Structural variants**: Claude generates alternative layouts, not just styling.

---

## 14. Decisions log (so far)

| Decision | Reason |
|---|---|
| Target Claude Code only in v1 | Real projects on the user's machine; enables future direct-apply. |
| Support HTML, React (Vite), Next.js, Tailwind v4 | Covers most Claude Code web projects; Tailwind v4 themes are already CSS variables. |
| Copy-and-paste round trip, not file writes | Works everywhere with no installs; browsers can't write to source files by default. |
| Overrides via one unlayered `<style>` element | Beats Tailwind's layered theme; never touches site elements. |
| Shadow DOM for the panel | Complete style isolation in both directions. |
| No company names or logos in font options | Avoids trademark issues; many brand fonts can't be embedded legally. |
| Suggestions written at build time | No runtime AI calls, no API keys, instant. |
| Panel is copied verbatim from the skill | Identical, tested behaviour every time; saves output. |
| Version flicking (Original · A · B · C) replaces Before/After | Instant, cheap (just swaps override values), and Original covers the before/after use case. |
| Versions stored as complete value sets | Lets alternative versions survive after another version is applied through Claude. |
| Side-by-side compare deferred to v2 | Needs iframes, scaling and scroll sync; pairs naturally with Device preview. |
| Button named "Try a new version", not "A/B test" | "A/B test" usually means testing versions on real visitors. |
