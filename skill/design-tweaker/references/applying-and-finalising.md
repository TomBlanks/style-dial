# Applying tweaks and finalising

## The pasted block

The user pastes text like this (possibly with other words around it):

````
```design-tweaks
Apply these design tweaks (design-tweaker v1)
version: B
tokens-file: src/index.css
--text-h1: 3.75rem;
--space-section: 112px;
--color-accent: #b4380a;
```
````

- `version:` is informational (which panel version A/B/C the user copied). Ignore it.
- `tokens-file:` says where the tokens live. If it doesn't match this project's tokens file (or the project has no such file), **stop and ask the user** which project the tweaks are for.
- Every other line is `--token: value;`. Only changed tokens are listed.

## Applying

1. **Update the token values** in the tokens file: exactly the listed tokens, exactly the listed values. Keep the file's formatting, comments and order. Don't rename, add or remove tokens, and don't touch component code.
2. **Update the config defaults** to the same values (as plain numbers in the token's unit, colours as lowercase `#rrggbb`). This is what makes the panel show 0 changes after reload: it recognises that the code now matches the version the user copied, and keeps any other versions as alternatives.
   - Make all config changes (defaults **and** refreshed suggestions) in **one edit** (or rewrite the whole config at once), so the file is never left half-edited. The user may reload at any moment, and a half-edited config shows an error in the panel.
   - Afterwards, **confirm the config is valid JSON**, e.g. `node -e 'JSON.parse(require("fs").readFileSync("src/dev/tweak.config.json","utf8"))'`; for the plain-HTML inline config, extract the `#tweak-config` block and parse it the same way.
3. If a value is outside the token's `min`/`max` in the config (it shouldn't be), widen the range to include it rather than changing the value.
4. **Refresh the suggestions** so they fit the updated design (see `suggestion-guide.md`): drop ones that no longer make sense or that the new values already cover, and write new ones so there are 3–5. Keep the ids of suggestions you keep unchanged.
5. If the tweaks now make the design fail a check (e.g. the user deliberately lowered contrast), apply them anyway and mention it in one sentence. Describe the problem itself ("muted captions on the gold cards are 2.5:1"); don't promise what the panel will or won't show.
6. Reply briefly: what changed (e.g. "Heading 1 is now 3.75rem, sections 112px, accent #b4380a") and that reloading the page will show the panel with 0 changes.

Don't apply anything from the block that isn't a `--token: value;` line, and don't make other design changes unless the user also asked for them in words.

## Font changes

There's no `fonts:` line in v1 (the panel doesn't change fonts). If the user asks in chat for different fonts, choose a pair (see `font-pairs.md`), update `--font-heading` / `--font-body` and the font loading, and remove imports for fonts no longer used. Fonts aren't in the config, so there's nothing to update there.

## Finalising

When the user says the design is final (or asks to remove the panel):

1. **Remove everything between the markers** (including the markers) in every file: `<!-- design-tweaker:start -->` … `<!-- design-tweaker:end -->`, `// design-tweaker:start` … `// design-tweaker:end`, and `{/* design-tweaker:start */}` … `{/* design-tweaker:end */}`.
2. **Delete the panel files and the config:** `tweak-panel.js`, `tweak-panel.d.ts`, `tweak.config.json`, and for Next.js `app/dev/DevTweakPanel.tsx`. Remove the `dev/` folder if it's now empty.
3. **Keep the tokens.** They're good practice. For Tailwind, `@theme static` can stay as it is.
4. Next.js: if the layout became `async` only for the panel, it may stay `async` (harmless) or be changed back.
5. **Confirm the production build still passes** (`npm run build` for Vite/Next). For plain HTML, open the page and check nothing references the removed files.
6. Tell the user it's done in one or two sentences.
