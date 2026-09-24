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
