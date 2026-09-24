# Design Tweaker

A floating dev-only panel for live-tweaking a site's design tokens, plus a Claude Code skill that builds sites on a token contract and applies the tweaks back into the code. See [design-tweaker-spec.md](design-tweaker-spec.md).

## Panel development

```sh
cd panel
npm install
npm test          # Vitest unit tests
npm run typecheck
npm run build     # → panel/dist/tweak-panel.js, copied to skill/design-tweaker/assets/
```
