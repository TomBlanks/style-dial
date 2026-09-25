# Token contract

Every site built with this skill follows these rules. The panel, its checks and the copy/paste round trip all depend on them.

## Rules

1. **Every adjustable design value is a CSS custom property.** Components never hard-code these values; they reference the token.
2. **All tokens live in one place** per project (see "Where tokens live").
3. **Use the exact names below**, in every project, Tailwind or not.
4. **Colour tokens are 6-digit lowercase hex** (`#1a1a1a`). No `rgb()`, `hsl()`, `oklch()`, named colours or 3-digit hex in token declarations.
5. **Units:** font sizes in `rem`, spacing in `px` (or `rem`), text width in `ch`, line height unitless, radius in `px`.
6. **Aim for 12–25 tokens.** Too few makes the panel useless; too many makes it overwhelming.
7. **Every declared token must be used by the page**, visibly. Changing any token's value must change what the user sees. Don't declare tokens "for later".

## Names and roles

| Token | Role | Type | Required |
|---|---|---|---|
| `--text-body` | `body-size` | size (rem) | ✅ |
| `--text-h1` | `h1-size` | size (rem) | ✅ |
| `--text-h2` | `h2-size` | size (rem) | ✅ |
| `--text-h3` | `h3-size` | size (rem) | if h3 is used |
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
| `--color-surface` | `surface` | color | optional (cards, panels) |
| `--color-accent` | `accent` | color | ✅ |
| `--color-accent-fg` | `accent-text` | color | optional (text on accent) |
| `--font-heading` | *(no role)* | font | ✅ (declared, but not in the config — see below) |
| `--font-body` | *(no role)* | font | ✅ (declared, but not in the config) |

You may add extra tokens (e.g. `--space-card`, `--radius-button`) without a role. They get sliders but no checks. Prefer the standard names whenever one fits.

**Fonts:** declare `--font-heading` and `--font-body` and use them for every heading and all other text. Do **not** list them in `tweak.config.json`; the panel doesn't adjust fonts in v1. Any third font (e.g. monospace for code) is a plain value, not a token.

**What the roles mean for the site:**
- `--color-fg` is used on **both** `--color-bg` and `--color-surface`, so it must read well on both. Don't put body text on a dark card on a light page; if a section needs light text, that's a separate design and outside the contract.
- `--color-accent-fg` is the text colour on accent-coloured buttons.
- `--measure` limits paragraph width (`max-width: var(--measure)`), not the whole layout.
- `--space-section` is the vertical padding of page sections; `--space-gap` is the gap between elements inside them.
- `--radius` is the corner radius of **every rounded rectangle**: buttons, cards, inputs, images, badges and tags. Only true circles and bars (avatars, dots, progress bars, toggle tracks) may use a fixed full rounding (`rounded-full`, `border-radius: 9999px`). If the design wants pill-shaped buttons, add an extra token `--radius-button` (label "Button radius", range 0–40px) instead of hard-coding it, so the user can still adjust it.
- `--color-muted` and `--color-accent` also appear on cards (captions, links), so they must work on `--color-surface` as well as `--color-bg`.

## Where tokens live

| Project type | Location |
|---|---|
| Plain HTML/CSS | `tokens.css`, linked **first** in `<head>`, one `:root { … }` block |
| React / Next.js without Tailwind | `src/styles/tokens.css` (or `app/tokens.css`), imported once at the app root, one `:root { … }` block |
| Tailwind v4 | One `@theme static { … }` block in the main CSS file (`src/index.css`, `app/globals.css`) |

### Tailwind v4 rules

- **Use `@theme static`.** Plain `@theme` silently drops any variable no utility references, which leaves dead sliders. **Never** use `@theme inline`: it bakes values into utilities, so runtime changes have no effect.
- Tokens in Tailwind's namespaces generate utilities: `--color-accent` → `bg-accent`, `text-accent`; `--text-h1` → `text-h1`; `--leading-body` → `leading-body`; `--font-heading` → `font-heading`.
- Tokens outside Tailwind's namespaces use the variable shorthand: `max-w-(--measure)`, `py-(--space-section)`, `gap-(--space-gap)`, `rounded-(--radius)`, `leading-(--leading-heading)`.

## Examples

### Plain CSS (`tokens.css`)

```css
:root {
  --font-heading: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  --text-body: 1.0625rem;
  --text-h1: 3.5rem;
  --text-h2: 2.25rem;
  --text-h3: 1.375rem;
  --leading-body: 1.6;
  --leading-heading: 1.1;

  --measure: 64ch;
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

### Tailwind v4 (`src/index.css`)

```css
@import "tailwindcss";

@theme static {
  --font-heading: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --text-body: 1.0625rem;
  --text-h1: 3.5rem;
  /* …the rest as above… */
}

@layer base {
  body { @apply bg-bg text-fg font-body text-body leading-body; }
  h1, h2, h3 { @apply font-heading leading-(--leading-heading); }
}
```

## Good vs bad

| ❌ Hard-coded | ✅ Tokenised |
|---|---|
| `h1 { font-size: 56px; }` | `h1 { font-size: var(--text-h1); }` |
| `<section class="py-24">` | `<section class="py-(--space-section)">` |
| `.btn { background: #c2410c; color: white; }` | `.btn { background: var(--color-accent); color: var(--color-accent-fg); }` |
| `<p class="max-w-prose">` | `<p class="max-w-(--measure)">` |
| `.card { border-radius: 12px; background: white; }` | `.card { border-radius: var(--radius); background: var(--color-surface); }` |
| `<button class="rounded-full …">` (pill hard-coded) | `<button class="rounded-(--radius) …">`, or `rounded-(--radius-button)` with an extra token |
| `--color-accent: rgb(194 65 12);` | `--color-accent: #c2410c;` |
| `@theme inline { --color-accent: #c2410c; }` | `@theme static { --color-accent: #c2410c; }` |

Non-token values are fine where nobody would want to tweak them: borders at 1px, shadows, icon sizes, z-indexes, breakpoints. Derived values may use `calc()` on tokens (e.g. `calc(var(--space-gap) * 0.5)`) or `color-mix()` on colour tokens.

## Recommended ranges

Use these for `min`, `max` and `step` in the config unless the design needs something else. Defaults must sit inside the range.

| Role | min | max | step |
|---|---|---|---|
| body-size | 0.875rem | 1.375rem | 0.0625 |
| h1-size | 1.75rem | 6rem | 0.125 |
| h2-size | 1.375rem | 4rem | 0.125 |
| h3-size | 1.125rem | 2.5rem | 0.0625 |
| small-size | 0.75rem | 1rem | 0.0625 |
| body-line-height | 1.2 | 2.2 | 0.05 |
| heading-line-height | 0.9 | 1.6 | 0.05 |
| measure | 35ch | 100ch | 1 |
| section-spacing | 24px | 200px | 4 |
| element-gap | 4px | 64px | 2 |
| radius | 0px | 32px | 1 |

## Start from a design the checks like

The panel runs design checks. Build so none of them fire on the original design:
- Body and muted text at least **4.5:1** contrast on the background **and** on the surface.
- Accent at least **3:1** on the background **and** on the surface; accent text at least **4.5:1** on the accent.
- `--measure` between 45ch and 75ch.
- Body text at least 16px (`1rem`); body line height between 1.4 and 2.0.
- Headings strictly decreasing: h1 > h2 > h3 > body, each at least 10% larger than the next.
