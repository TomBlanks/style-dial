# Style Dial

[![CI](https://github.com/TomBlanks/style-dial/actions/workflows/ci.yml/badge.svg)](https://github.com/TomBlanks/style-dial/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Panel size](https://img.shields.io/badge/panel-18%20KB%20gzipped-brightgreen)
![Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-brightgreen)

**Stop describing design changes to Claude. Drag them.**

Style Dial is a Claude Code skill and a tiny in-browser panel. Claude builds your site with every design value as a live token, and puts a panel in the corner of the page with sliders, colour pickers, design checks and tailored suggestions. You tune the design by eye, click **Copy changes**, paste the result into Claude Code, and the edits go straight into your source.

**[▶ Try the live demo](https://tomblanks.github.io/style-dial/)**, no install needed.

![The Style Dial panel open on a website, with sliders for text width and corner radius and colour pickers](docs/images/hero.png)

---

## Why

Fine-tuning an AI-built site through chat goes like this:

> "Make the heading a bit bigger."  
> "No, smaller than that."  
> "Can the orange be a bit more… burnt?"  
> "Actually, go back to what it was two tries ago."

Every round trip means waiting, re-reading a diff and reloading the page. Visual adjustments belong on a slider, not in a prompt.

With Style Dial you:

- **See it instantly.** Every change repaints the page as you drag. There's no rebuild and no waiting.
- **Stay in control.** Nothing touches your code until you paste the changes back. Try a direction, hate it, undo.
- **Get exact edits.** Claude receives a precise block (`--text-h1: 3.75rem;`), not "a bit bigger". It updates those values and nothing else.

## How it works

1. **Ask Claude Code to build or restyle a site**, as you normally would. The skill triggers on its own.
2. **Claude builds on a token contract.** Every adjustable size, spacing and colour becomes a CSS variable in one place. Claude also writes a small config and installs the panel for development only.
3. **Open the site.** The panel sits in the bottom-right corner. Drag, pick, try versions, fix what the checks flag.
4. **Click Copy changes and paste into Claude Code:**
   ````
   ```style-tweaks
   Apply these style tweaks (style-dial v1)
   version: B
   tokens-file: src/index.css
   --text-h1: 3.75rem;
   --space-section: 112px;
   --color-accent: #b4380a;
   ```
   ````
5. **Claude updates your tokens.** The panel resyncs and shows **0 changes**, because your code now matches what you designed. With Vite and Next.js this happens by itself; with plain HTML, reload the page.
6. **Say "the design is final"**, and Claude removes the panel and its config and keeps your clean tokens.

## What's in the panel

### Live controls
Sliders and number inputs for type sizes, line heights, text width, section spacing, gaps and corner radius, plus colour pickers with hex input. Changed values get a blue dot and a one-click reset. Every change can be undone (⌘Z / ⌘⇧Z), and a whole slider drag is a single undo step.

### Versions: try A, B and C and flick between them
Hit **+** to branch a new version from the one you're on. Flick between **Original · A · B · C** instantly (⌥⇧1–4), with nothing reloaded. Each version keeps its own undo history, and all of them survive a page refresh. Here's the same page as the original and as a bolder Version B, without touching the code:

<table>
<tr>
<td><img src="docs/images/version-original.png" alt="The original design: light cream background with dark serif headings"></td>
<td><img src="docs/images/version-b.png" alt="Version B: the same page with a dark background, light text and a warm orange accent"></td>
</tr>
<tr><td align="center"><sub>Original</sub></td><td align="center"><sub>Version B</sub></td></tr>
</table>

### Design checks with one-click fixes
Fourteen rules run as you tweak: text contrast on the page and on cards (WCAG), accent visibility, text on buttons, line length, body text size, line height and heading hierarchy. Most have a **Fix** button that makes the smallest change that solves the problem. Contrast fixes keep the colour's hue and change only its lightness, and fixes never fight each other. A 5,000-design stress test clears every colour warning in five clicks or fewer.

### Suggestions written for *your* site
When Claude builds the site, it also writes 3–5 design ideas specific to it, like "Deeper, kiln-fired accent: a darker terracotta echoes the iron-red glaze on the bud vases". **Preview** one on the live page, then **Apply** or **Cancel**. Suggestions you've already gone past step aside. Nothing is final until you copy.

<table>
<tr>
<td><img src="docs/images/checks.png" alt="The Checks tab listing contrast and line-length warnings, each with a Fix button"></td>
<td><img src="docs/images/suggestions.png" alt="The Suggestions tab with one suggestion applied and another being previewed with Cancel and Apply buttons"></td>
<td><img src="docs/images/dark.png" alt="The panel in dark mode showing versions A and B and typography sliders"></td>
</tr>
<tr><td align="center"><sub>Checks</sub></td><td align="center"><sub>Suggestions</sub></td><td align="center"><sub>Dark mode</sub></td></tr>
</table>

## Install

The skill lives in [`skill/style-dial`](skill/style-dial). Put it in your Claude Code skills folder:

```sh
git clone https://github.com/TomBlanks/style-dial.git
mkdir -p ~/.claude/skills
cp -R style-dial/skill/style-dial ~/.claude/skills/
```

(Use `ln -s` instead of `cp -R` if you'd like updates to the clone to apply automatically.)

That's it. There's nothing to add to your projects by hand; Claude installs the panel when it builds a site.

## Use it

Just ask for a website:

> Build a landing page for "Tally", a budgeting app for couples, using React with Vite and Tailwind CSS v4.

> Restyle this site so it feels calmer and more modern. Keep the content the same.

Then open the site in development, tweak, copy, paste. When you're happy:

> The design is final.

| Shortcut | Action |
|---|---|
| ⌥⇧T | Open / minimise the panel |
| ⌥⇧1 / 2 / 3 / 4 | Show Original / A / B / C |
| ⌘Z / ⌘⇧Z | Undo / redo (while the panel has focus) |
| Esc | End a suggestion preview |

## Works with

| Stack | Panel runs | In production |
|---|---|---|
| Plain HTML/CSS | Always, until you say the design is final | Removed by Claude when final |
| React + Vite | `npm run dev` only | **Not shipped**: Vite strips it |
| Next.js (App Router) | `next dev` only | **Not shipped**: no panel code in `next build` output |

Each works with or without **Tailwind CSS v4**. Tokens go in `@theme static`, so Tailwind utilities like `bg-accent` and `text-h1` stay live.

## Under the hood

```mermaid
flowchart LR
    A[Claude Code builds the site] --> B[Design tokens<br/>CSS variables in one file]
    B --> C[Panel in the browser<br/>overrides tokens live]
    C -->|Copy changes| D[style-tweaks block]
    D -->|Paste| E[Claude edits only<br/>those token values]
    E --> B
```

A few of the engineering decisions behind it. Every trade-off is logged in [DECISIONS.md](DECISIONS.md), against the original [spec](design-tweaker-spec.md).

- **One dependency-free file.** The panel is written in TypeScript and bundled by esbuild into a single IIFE: 51 KB raw, **18 KB gzipped**. The build fails if it goes over a 30 KB gzipped budget.
- **Isolated both ways.** The panel renders inside Shadow DOM, so the site's CSS can't break the panel and the panel can't leak into the site.
- **Overrides without touching your markup.** Live values are written to one unlayered `<style>` element. Unlayered rules beat Tailwind v4's layered theme, so utilities like `bg-accent` update instantly and no site element is ever modified.
- **Contrast fixes that keep your colours.** The WCAG checks work in OKLCH and change only lightness, so a fixed colour keeps its hue. Every fix searches for the smallest lightness change that satisfies all the pairs a colour belongs to, so fixes never undo each other. In a stress test of 5,000 random designs, every one was cleared of colour warnings in five clicks or fewer, and the slowest check run took about 7 ms.
- **Versions and undo.** Each version (A, B, C) stores a complete set of values with its own undo history, and survives a page refresh. A whole slider drag is a single undo step.
- **Never shipped to production.** End-to-end tests build the Vite and Next.js examples for production and check that no panel code is in the output.
- **Tested.** 164 Vitest unit tests cover config validation, colour maths, checks, history and export, and 21 Playwright tests run all three example stacks in dev and production, including an axe accessibility audit. CI also checks that the bundle shipped in the skill matches the source.

## Limitations

- **Claude Code only.** The skill relies on Claude Code editing files in your project.
- **Copy and paste.** Browsers can't write to your source files, so changes go back through Claude. Applying them directly is on the roadmap.
- **Tokens, not layouts.** The panel adjusts sizes, spacing, radii and colours. Structural changes still happen in chat.
- **No font control yet.** Ask Claude for font changes in chat for now.

<details>
<summary><strong>Repository layout</strong></summary>

```
panel/      The panel: TypeScript source, esbuild build, 164 Vitest unit tests
skill/      The Claude Code skill: SKILL.md, references, and the built panel
examples/   Plain HTML, React + Vite + Tailwind, and Next.js + Tailwind sites
e2e/        21 Playwright tests across all three examples (dev + production)
docs/       README images
```

</details>

<details>
<summary><strong>Development</strong></summary>

```sh
cd panel
npm install
npm test            # unit tests
npm run typecheck
npm run build       # → dist/tweak-panel.js, copied into the skill and every example
```

Run the examples:

```sh
open examples/plain-html/index.html
cd examples/react-vite-tailwind && npm install && npm run dev
cd examples/nextjs-tailwind && npm install && npm run dev
```

End-to-end tests (uses your installed Chrome; run `npm install` in each example first):

```sh
cd e2e && npm install && npm test
```

</details>

## Status and what's next

**v1 is complete.** Read the full [spec here](design-tweaker-spec.md).

On the roadmap:
- **Apply directly to files**, so there's no copy and paste.
- **Side-by-side compare** of two versions.
- **Font pairing** in the panel (for now, ask Claude in chat).
- **More versions**, **inspect mode** and **pinned notes**.

## License

[MIT](LICENSE)
