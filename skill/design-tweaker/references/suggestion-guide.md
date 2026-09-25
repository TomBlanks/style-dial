# Writing suggestions

Suggestions are named, one-click design ideas the user can preview and apply in the panel's Suggestions tab. You write them into the config when you build (or rebuild) the site. There are no AI calls at runtime, so each one must stand on its own.

## Requirements

- **3–5 suggestions** per site.
- **Specific to this design and its purpose.** Mention the brand, the audience, the product or a particular section. Generic advice ("increase whitespace") is not a suggestion.
- **Each changes 1–3 tokens.**
- **Never duplicate a check.** The panel already warns about contrast, line length outside 45–75ch, body text under 16px, body line height outside 1.4–2.0, and headings out of order. Don't suggest "improve contrast" or "make body text 16px".
- **All values inside the tokens' ranges**, in the token's unit, colours as `#rrggbb`.
- **Aim for variety:** e.g. one about type scale, one about spacing or rhythm, one about colour, one about shape (radius, gaps).
- **Make them real alternatives, not fixes.** Every suggestion should be a defensible design choice the user might or might not want, and the original must also be good.
- **Move clearly away from the current value.** A 1px nudge isn't worth a card. The panel hides size and spacing suggestions the user has already gone past, so direction matters.
- **Don't change fonts.** Fonts aren't in the panel in v1; offer font changes in chat instead.
- **After applying a round of tweaks, refresh the suggestions** so they fit the updated design (see `applying-and-finalising.md`).

Format: `title` is a short imperative or noun phrase (max ~40 chars). `reason` is one sentence (max ~120 chars) that says *why* for this site.

## Good examples

```json
{ "id": "morning-hero", "title": "A bigger morning welcome",
  "reason": "The headline is the bakery's whole pitch; give it more size and room above today's bakes.",
  "changes": { "--text-h1": 4.5, "--space-section": 120 } }
```
Specific (bakery, the headline's job), two related tokens, a clear step up.

```json
{ "id": "moss-accent", "title": "Deeper moss green",
  "reason": "A darker, more muted green reads as 'library' rather than 'fintech' for a research audience.",
  "changes": { "--color-accent": "#24533d" } }
```
A colour alternative with a reason tied to the audience. It still passes the accent contrast check.

```json
{ "id": "reading-width", "title": "Book-like line length",
  "reason": "Researchers read long passages; a narrower measure and airier leading feel like a printed page.",
  "changes": { "--measure": 58, "--leading-body": 1.7 } }
```
A rhythm change that stays inside the checks' comfortable range (not a fix for a problem).

## Bad examples

```json
{ "id": "contrast", "title": "Improve text contrast",
  "reason": "Better contrast improves accessibility.",
  "changes": { "--color-muted": "#3f3a36" } }
```
❌ Duplicates a check, and it's generic. If contrast were a problem the original design would be wrong.

```json
{ "id": "bigger", "title": "Make headings bigger",
  "reason": "Bigger headings look more modern.",
  "changes": { "--text-h1": 3.625, "--text-h2": 2.3125, "--text-h3": 1.4375, "--text-body": 1.125 } }
```
❌ Generic reason, four tokens, and tiny steps (1–2px) that nobody would notice.

```json
{ "id": "huge-hero", "title": "Massive hero",
  "reason": "Make the studio name impossible to miss.",
  "changes": { "--text-h1": 8, "--space-section": 20 } }
```
❌ `8rem` and `20px` are outside the tokens' ranges (the panel will clamp them and warn), and the two changes pull in opposite directions.
