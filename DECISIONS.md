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
| 2026-09-24 | §6.8 | A font pair change counts as one change in "N unsaved changes". | Confirmed by the user. |
