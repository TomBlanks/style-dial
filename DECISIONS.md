# Decisions

Decisions made while building v1, including anywhere the implementation departs from `design-tweaker-spec.md`. Newest entries at the bottom of each section.

## From the spec (§14)

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

## During the build

| Date | Spec § | Decision | Reason |
|---|---|---|---|
| 2026-09-24 | §3 | The repo root is `styledial/`, not `design-tweaker/`. | It's the existing repo. |
| 2026-09-24 | §5.3 | Only a missing or invalid `version` or `tokens` is fatal. Missing `id` falls back to `"default"`, a missing or unknown `framework` falls back to `"html"`, and a missing `tokensFile` becomes `""`. Each of these logs a warning. | The spec lists only those as fatal. The panel is still useful without the other fields. |
| 2026-09-24 | §5.3 | `fonts` is optional. If it's missing or has no valid pairs, the font control is hidden and a warning is logged. An unknown `fonts.default` falls back to the first pair. | The spec doesn't say what happens here. Hiding the control is safer than failing. |
| 2026-09-24 | §5.3 | Also treated as non-fatal skips: duplicate token vars, `--font-heading`/`--font-body` listed as tokens, unknown group/type/unit, `step <= 0`, and suggestions with no changes. An unknown `role` is dropped but the token is kept. | These extend the "bad item is skipped" rule to cases the spec doesn't cover. |
| 2026-09-24 | §4.1 | Config colour values must be exactly 6-digit hex (`#fff` is rejected). The stale-default check does accept 3-digit hex from the page CSS. | Follows rule 4.1.4 strictly for the config. The page check is lenient so it doesn't cause false alarms. |
| 2026-09-24 | tooling | TypeScript 5.9, not 7.x. | TS 7 (native port) is new. 5.9 is the stable choice for tsc checks. |
| 2026-09-24 | §6.8 | ~~A font pair change counts as one change in "N unsaved changes".~~ Superseded: fonts are out of v1 (see below). | Confirmed by the user. |
| 2026-09-24 | §6.3 | Every time the override `<style>` is written, it moves itself back to the end of `<head>` if something was added after it. | Dev servers such as Vite add `<style>` tags at runtime. A plain `:root` block added after ours would otherwise win on source order. Tailwind's layered `@theme` is unaffected either way. |
| 2026-09-24 | §3 | `npm run build` also copies `tweak-panel.js` into `examples/plain-html/`. | Keeps the example running the latest panel without a manual copy step. |

## Panel design (agreed through the M1.3 mockup, 2026-09-24)

| Spec § | Decision | Reason |
|---|---|---|
| §1, §4, §5, §6.5, §6.11 | **Fonts are out of v1.** The panel has no font control and doesn't load fonts. There's no `fonts:` line in the export, and suggestions can't change fonts. A `fonts` section or a suggestion's `fontPair` in the config is ignored with a console warning. Sites still declare `--font-heading` and `--font-body` tokens, so a font control can be added later without rebuilding sites. | The user decided. Per-element font choice would need a bigger token contract, and pairs alone weren't worth the complexity for v1. Font changes go through chat for now. |
| §6.2 | Solid panel background: white in light mode, `#1e1e20` in dark. It isn't translucent. | The user prefers it. It's also easier to read over busy sites. |
| §6.4 | The panel is a fixed height of `min(52vh, 450px)` and doesn't change height when switching tabs. It's full width on viewports under 480px. | A steadier layout. The user asked for about 75% of the first mockup's 70vh. |
| §6.4, §6.10 | There's no title row. The top row holds the version tabs, a **+** button and the minimise button. The panel's accessible name is still "Design Tweaker". | Saves a row and reduces clutter. |
| §6.10 | "Try a new version" is a **+** icon button. A "Try a new version" tooltip appears above it on hover or keyboard focus, and it's also the button's accessible name. | Less visual weight. The user asked for this. |
| §6.10 | Version tab letters are centred in a fixed-width tab. A version with changes shows a blue dot in the tab's top-right corner. Hovering over the *selected* tab hides the dot, moves the letter left and shows the ✕ on the right; the tab width doesn't change. Deleting always asks first ("Delete Version B? Its 3 changes will be lost."), with Cancel focused and Delete in red. | Balanced tabs with no layout jumps (the user asked for this). Tiny tabs made the ✕ easy to hit by accident. |
| §6.8 | Footer: undo, redo and a Reset all icon on the left, with **Copy N changes** on the right. There's no separate "Version B · N unsaved changes" line. Reset all has its own boxed-arrow icon, different from the per-token reset arrow. | Less text. The count lives in the button. |
| §6.5 | A changed value shows a small blue dot after its label, and the per-token reset arrow appears. | Scannable at a glance. |
| §6.10 | Original view replaces the footer with "Showing the original design. Pick a version to edit." Checks show without Fix buttons. The Suggestions tab shows "Pick a version to preview them" instead of the cards. | Original is a read-only baseline, so it shouldn't offer actions or show "Applied" states. |
| §6.7 | Suggestion card flow: **Preview** first, then **Cancel** (left) or **Apply** (right) while previewing. Previewing another card cancels the current preview. | The user asked for this. |
| §6.7 | Applied suggestions stay in the list with a blue ✓ Applied tag and aren't dimmed. Clicking ✓ Applied undoes it: the suggestion's tokens go back to their values just before Apply, as one history entry. Applied cards leave the list when **Copy changes** is clicked. Each version has its own applied states. If the values later stop matching (undo, manual edit), the card shows Preview again. After a reload, a suggestion whose values still match shows ✓ Applied, because the panel doesn't remember what was copied. | The user asked for this. Nothing is final until it's copied to Claude. |

## M1.4 build notes (2026-09-24)

| Spec § | Decision | Reason |
|---|---|---|
| §6.2 | The host element's `position: fixed`, `z-index` and `display` are set inline with `!important`. Inside the shadow root, `:host` uses `all: initial` and `pointer-events: none`; only the launcher and window accept clicks. | Site rules like `* { position: relative }` would otherwise move the panel. At phone width the host spans the screen, so it must let taps through when minimised. |
| §6.5 | A typed number is clamped to [min, max] on blur but not snapped to `step`, so typing `1.07` keeps `1.07`. Sliders still move in steps. | Typing is for exact values. |
| §6.5 | The hex field also accepts 3-digit hex and hex without a `#`, e.g. `abc` → `#aabbcc`. The stored value is always 6-digit lowercase. Escape cancels typing. | Quicker to type. Rule 4.1.4 is still met because stored and exported values are 6-digit. |
| §6.5 | In Original view the colour swatches stay at full opacity while disabled. | Faded swatches misrepresent the original colours. |

## M2.1 build notes (2026-09-24)

| Spec § | Decision | Reason |
|---|---|---|
| §6.9 | ⌘/Ctrl+Z and ⌘/Ctrl+⇧Z act on the panel's history when focus is inside the panel, **except** in the number and hex text fields. There they keep the browser's normal text undo. | Taking over undo while someone is typing would be surprising. |
| §6.9 | If undo is pressed during an unfinished live edit, the edit is recorded first and then undone, so nothing is lost and redo brings it back. Making a live edit after an undo clears redo. | Standard undo behaviour. |
| §6.8 | Reset all is disabled when the version has no changes. The inline confirmation focuses **Cancel**, and Escape cancels. After a reset, focus moves to Undo. | Safe default: an accidental Enter doesn't wipe the version, and Undo is the natural next step. |
| §6.8 | Undo/Redo tooltips show ⌘ on Mac and Ctrl elsewhere. | Correct shortcut on each platform. |

## M2.2 build notes (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §6.10 | Any version can be deleted, including A, as long as at least one version remains. "Version A always exists" is read as "A exists at the start". | The spec also says any tab except the only one has a ✕, and that "a new version takes the first free letter", which only makes sense if A can be deleted. |
| §6.10 | Deleting the version that's showing switches to the nearest remaining version: the one to its left, or failing that the one to its right. Deleting a version also deletes its history, so re-creating a letter starts with an empty history. | Keeps you on an editable version and avoids surprise undo steps from a deleted version. |
| §6.10 | **+** when Original is showing creates a copy of the defaults. | Original is what's showing, and the spec says to copy the active view. |
| §6.10, §6.12 | Keyboard: arrow keys, Home and End move between version tabs. **Delete** or **Backspace** on a focused version tab opens the delete confirmation. The ✕ also shows while the selected tab has keyboard focus. | Makes deleting fully keyboard-operable, since the ✕ is otherwise hover-only. |

## M2.3 build notes (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §9 | Only committed values are saved. An unfinished slider drag isn't written until it's released. The open/closed state, the tab and the active view (including Original) are saved with the versions. | "Storage is updated whenever the committed state changes" (§9). The active view is restored so a reload drops you back where you were. |
| §9 | Reconciliation runs token by token. It also repairs stored values: out-of-range numbers are clamped, and a wrong type or invalid hex falls back to the default. Unreadable storage gives a fresh Version A. | Stored data can go stale when the config's ranges or types change. |
| §6.11 | Clicking **Copy changes** first commits any unfinished edit, so the copied text matches what's on screen. | Keeps the export and the page in sync. |
| §6.11 | The temporary textarea used by the `execCommand` fallback is created inside the panel's shadow root. If both methods fail, a "Copy this manually" box covers the panel with the text pre-selected; Close or Escape dismisses it. | The site's DOM is never touched. The box is always readable at the panel's size. |

## M3.1 build notes (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §7 | The spec's OKLCH lightness-fix method **works as written**. Tested on 8 realistic pairs, light and dark, low and high chroma: every fix reached its target, hue stayed within about 2°, and chroma dropped only where the darker colour wouldn't fit in sRGB. | Checked before building on it (the user flagged this as a risk). |
| §7 | "Light background" means one where black text contrasts more than white. Light backgrounds search darker, dark backgrounds search lighter. | A precise version of the spec's "darker on light backgrounds, lighter on dark ones". |
| §7 | The search is a binary search on OKLCH lightness, with contrast checked against the final rounded hex value. The returned colour always meets the target, even after rounding. | Checking the pre-rounding value could produce a hex that falls just short. |
| §7 | Sanity note: the black/white fallback almost never fires for 4.5:1 or 3:1. On any background, whichever of black or white the search heads toward reaches at least 4.58:1. It's kept for completeness and tested with an impossible 7:1 target. | So nobody expects to see it in normal use. |
| §7 | Relative luminance uses the 0.04045 sRGB threshold from the current WCAG 2.x text, rather than the older 0.03928. | The results are the same to 2 decimal places. It matches the corrected spec text. |
| §7 | **Fix buttons aim 0.1 above the target**: 4.6:1 for text and 3.1:1 for accents (`FIX_MARGIN`). If that can't be reached, they aim for the plain target. The check still triggers at exactly the spec thresholds (4.5 and 3.0). C4 still picks black or white. | The user asked for this. Fixes landing at 4.51:1 would fail again after the slightest tweak. |

## M3.2 build notes (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §7 C1, C5 | Body text sits on both the page background and the card surface, so C1 and C5 fixes must agree. Both first look for **one text colour that reads on both**, searching darker *and* lighter for the smallest lightness change. If no such colour exists (e.g. light page, dark cards), C1 fixes the text against the page, and **C5 adjusts the card colour instead** ("No text colour works on both the page and the cards, so Fix adjusts the card colour."). Stress test: 3,000 random designs all settle with no colour warnings after at most 5 Fix clicks. | The spec's one-direction, one-background fix made C1 and C5 undo each other in an endless loop (the user reported this; 56 looping combinations reproduced). |
| §7 C3 | **The accent Fix also protects text on the accent** (user decision). After reaching 3:1 on the background, it keeps moving the accent's lightness the same way until the accent-text colour reaches 4.5:1 on it. It only does this if both stay satisfied; otherwise just the accent is fixed and C4 handles the text. | One click fixes a light accent button without flipping white button text to black. |
| §7 C11 | One warning per out-of-order adjacent pair, naming both, e.g. "Heading 2 (60px) is larger than Heading 1 (56px)." Equal sizes count as out of order ("…are the same size"). | "Names which pair is out of order." Several pairs can be wrong at once. |
| §7 C12 | "Within 10%" means the larger size is less than 1.1 × the smaller. It's only reported for pairs that are in the right order, since C11 already covers the others. | Avoids two messages about the same pair. |
| §7 C8 | The fix is `1` for rem body text and `16` for px body text. All fix values are clamped into the token's range. | The contract allows either unit. A fix must never produce an out-of-range value. |
| §7 | Checks run straight away when the panel mounts, then 100ms after each change. The Checks badge counts warnings only and is hidden at 0. | Results are there as soon as you open the tab. |
| §7 | Contrast ratios in messages are shown to 1 decimal place, e.g. "2.4:1". | Matches the spec's example message. |

## M4 build notes (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §6.7 | A preview is a separate layer in the store. It's included in the page's override CSS only; it isn't part of the version's values, the change count, history, saving, checks or the copied text. **Any** other store change ends it: an edit, a Fix, undo/redo, reset, or switching or creating a version. Switching tabs and Escape end it too. Minimising the panel doesn't, so you can see the preview unobstructed. | "Clicking another control … ends the preview" (§6.7), made precise. |
| §6.7 | Un-applying (clicking ✓ Applied) restores the values from just before Apply, as one history entry. After a reload those aren't known, so it falls back to the original design's values for those tokens. | Pre-Apply values are kept in memory only, like history. |
| §6.7 | Which applied suggestions were copied is remembered per version, in memory only. A copied card comes back if it stops being applied (undo, manual edit, un-apply). | Matches the agreed rule that nothing is final until it's copied, and nothing is lost by accident. |
| §6.7 | Empty states: "No suggestions for this design." when the config has none; "No suggestions left for this version." when all were applied and copied; in Original, "Suggestions are tried on a version. Pick a version to preview them." | Clear wording for each case. |
| §6.7 | The card's change summary shows the changed tokens' labels as small chips, e.g. "Heading 1", "Section spacing". This replaces a comma-separated line. | Matches the approved mockup. |

## M5.1 build notes: Vite + Tailwind v4 (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §4.3, §4.4 | **Tailwind projects declare tokens with `@theme static { … }`, not plain `@theme`.** Tested on Tailwind 4.3.3: plain `@theme` **drops variables that no utility uses**. In the probe, `--text-h2`, `--text-h3`, `--space-gap` and `--color-surface` were missing from the CSS, so their sliders did nothing and the out-of-date check warned. `static` emits every token in the block. Tailwind's own unused defaults are still trimmed, so the cost is a few bytes. `@theme inline` is still forbidden. | Found by testing (Tailwind's actual output, one of the flagged risks). |
| §6.3 | Confirmed: Tailwind v4 outputs theme variables as `@layer theme { :root, :host { … } }`. The panel's unlayered `:root` override wins in the dev server; Heading 1 and the accent changed live. | Confirms the spec's assumption. |
| §5.3 | Confirmed: production minification shortens colours, e.g. `#ffffff` → `#fff`. The out-of-date check already accepts 3-digit hex, so no false warnings. | Noted for anyone reading computed values. |
| §10.2 | Confirmed as written: Vite removes the `import.meta.env.DEV` block from production builds. Neither the panel code nor the config appears in `dist/`. The `import("./dev/tweak-panel.js")` side-effect import works with the IIFE file, and `tweak-panel.d.ts` beside it types `window.TweakPanel` under `tsc --noEmit`. | Verified. |
| §3 | `npm run build` in `panel/` also copies `tweak-panel.js` and `tweak-panel.d.ts` into `examples/react-vite-tailwind/src/dev/`. | Examples always run the latest panel. |

## Changes from review during M5.1 (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §7 C11 | **The heading-order warning now has a Fix** (the spec had none; user decision). It repairs the whole type scale in one click. It keeps the size the user changed (the upper heading of the pair, or the lower one if only that changed) and moves the others. Each level ends up at least 10% bigger than the one below, snapped to the token's step. **Body text is never changed.** Stress test: 2,000 random scales on the Fieldnotes config all fixed in 1 click, with body text never shrunk. | The user wanted a Fix. A first version that fixed one pair at a time looped in 22 of 2,000 cases, so the whole scale is repaired at once. |
| §6.7 | **Size and spacing suggestions you've already gone past are hidden** (user decision). A suggestion counts as passed when every numeric change has been reached or exceeded in the direction it moves from the default (e.g. Heading 1 suggested 4.75rem from 4rem, and it's now 5.5rem). Colour changes only count when equal. It reappears if the values move back, e.g. after undo. | Stops the panel offering a change that would actually undo what you did. |

## M5.2 build notes: Next.js 16 + Tailwind v4 (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §10.3 | **The layout imports `DevTweakPanel` only in development**, not with a top-level import. The layout is `async` and does `const DevTweakPanel = process.env.NODE_ENV === "development" ? (await import("./dev/DevTweakPanel")).default : null;` then renders `{DevTweakPanel && <DevTweakPanel />}`, all inside the `design-tweaker:start/end` markers. | Tested on Next 16.3: with the spec's top-level import, **the whole panel and the config shipped as chunks in the production build** (`.next/static`). They were never rendered, but they were downloadable, which fails the acceptance criterion. With the dev-only import, no panel code, config or component appears in the production output. |
| §10.3 | `DevTweakPanel`'s effect uses a `cancelled` flag and skips `mount` if the effect was already cleaned up. | React Strict Mode runs effects twice in development. The spec's snippet then called `mount` twice and logged "mount() called twice; ignoring." |
| §10.3 | Confirmed: `import("./tweak-panel.js")` works with Next's bundler for the IIFE file, and `tweak-panel.d.ts` types `window.TweakPanel` in `next build`'s TypeScript step. The panel mounts after hydration with no hydration warnings. The `app/dev/` folder doesn't become a route, because it has no `page.tsx`. | Verified (one of the flagged risks). |
| §10.3 | The example's `next.config.ts` sets `agentRules: false`. | Next 16 otherwise writes `AGENTS.md` and `CLAUDE.md` into the project on first `next dev`. |
| §10.4 | Fonts in the Next example use `next/font/google`, and the font tokens point at the variables it creates (`--font-heading: var(--font-young-serif), Georgia, serif`). | What §10.4 prescribes for Next. It's unaffected by fonts being out of the panel. |
| §3 | `npm run build` in `panel/` also copies the panel and types into `examples/nextjs-tailwind/app/dev/`. | Examples always run the latest panel. |

## M5.3 build notes: end-to-end tests (2026-09-25)

| Spec § | Decision | Reason |
|---|---|---|
| §12 M5 | Playwright uses the **locally installed Chrome** (`channel: "chrome"`) instead of downloading browsers. The plain-HTML example is served by a tiny dependency-free static server (`e2e/static-server.mjs`) so the clipboard works; it doesn't over `file://`. | Nothing extra to install. The clipboard API needs an http(s) origin. |
| §12 M5 | Next's production build runs before its dev server in the Playwright `webServer` list. | `next build` wipes `.next`, which the dev server also uses. |
| §12 M5 | The "updating the config default clears the override" test runs on the plain-HTML example. It serves a modified `index.html` and `tokens.css` with Playwright routing, as if Claude had applied the tweak. Reconciliation itself is the same code in every framework and is unit-tested in `persist.test.ts`. | The inline config makes the change easy to simulate without editing files on disk. |
| §12 M5 | Each test was checked against deliberately broken versions (absence check pointed at a dev server, wrong copy text) to prove the assertions can fail. | A suite that has only ever passed proves little. |
| §6.10 | Version shortcuts are **⌥⇧1 = Original, ⌥⇧2 = A, ⌥⇧3 = B, ⌥⇧4 = C** (the spec had ⌥⇧0–3). | The user asked for this: 1 for the first tab reads more naturally than 0. |
