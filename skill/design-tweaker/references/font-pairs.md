# Choosing fonts

The panel doesn't switch fonts in v1, so the pair you choose when building is the one the user sees. Choose deliberately, set it on `--font-heading` and `--font-body`, and change it in chat when the user asks.

## How to choose

- **One pair: a heading font and a body font.** Every heading uses the heading font; everything else uses the body font. Only add a third font when the content needs it (e.g. monospace for code), and don't make it a token.
- **Match the site's character.** A bakery or ceramics studio suits a warm serif heading; a developer tool suits a clean grotesque; a law firm suits a sober serif or a restrained sans.
- **Contrast, not conflict.** Pair a characterful heading with a quiet, highly readable body font. Two decorative faces fight; two near-identical sans-serifs look like a mistake.
- **Readable body text first.** Body fonts need open shapes and good screen rendering at 16–18px.
- **Load only the weights you use** (usually 400 and 600 for body; one or two for headings).
- **Always give a fallback stack** so text renders sensibly before the web font loads: serif headings fall back to `Georgia, serif`; sans to `system-ui, sans-serif`.
- **Never use company or brand names** for a pair or anywhere in the config, and avoid fonts named after companies (e.g. fonts with a vendor's name in the family). All fonts below are openly licensed on Google Fonts.

## Token values

```css
--font-heading: "Fraunces", Georgia, serif;
--font-body: "Inter", system-ui, sans-serif;
```

**System option** (no web fonts, fastest, neutral):

```css
--font-heading: system-ui, -apple-system, "Segoe UI", sans-serif;
--font-body: system-ui, -apple-system, "Segoe UI", sans-serif;
```

## Starter pairs

| Character | Heading (weights) | Body (weights) |
|---|---|---|
| Editorial | Fraunces (600, 700) | Inter (400, 600) |
| Warm craft | Young Serif (400) | Figtree (400, 600) |
| Quiet literary | Newsreader (500, 600) | Instrument Sans (400, 500, 600) |
| Classic elegant | Cormorant Garamond (500, 600) | Source Sans 3 (400, 600) |
| Bookish | Literata (500, 700) | Literata (400) |
| Modern serif | DM Serif Display (400) | DM Sans (400, 500) |
| Friendly geometric | Outfit (500, 600) | Outfit (400) |
| Technical | Space Grotesk (500, 700) | Inter (400, 500) |
| Confident grotesque | Bricolage Grotesque (600, 700) | Hanken Grotesk (400, 500) |
| Soft rounded | Nunito (700, 800) | Nunito (400, 600) |
| Sober professional | Spectral (500, 600) | Karla (400, 500) |
| Old-style | EB Garamond (500, 600) | Lato (400, 700) |
| Bold display | Syne (700) | Manrope (400, 500) |
| Clean neutral | Manrope (600, 700) | Manrope (400, 500) |
| Crisp contemporary | Plus Jakarta Sans (600, 700) | Plus Jakarta Sans (400, 500) |

Single-family pairs (the same font for both) are fine when the family has a clear weight range; use weight and size to separate headings from body.

## Loading fonts

- **Plain HTML / Vite:** one Google Fonts `<link>` in `<head>` with `display=swap`, requesting only the families and weights you use.
- **Next.js:** `next/font/google`, with the font's CSS variable wired into the tokens:
  ```tsx
  const heading = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-fraunces" });
  // <html className={heading.variable}> …
  ```
  ```css
  --font-heading: var(--font-fraunces), Georgia, serif;
  ```
