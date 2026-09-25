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

## Examples

| Example | Run |
|---|---|
| Plain HTML | Open `examples/plain-html/index.html` in a browser |
| React + Vite + Tailwind v4 | `cd examples/react-vite-tailwind && npm install && npm run dev` |
| Next.js + Tailwind v4 | `cd examples/nextjs-tailwind && npm install && npm run dev` |

`npm run build` in `panel/` copies the latest panel into all three examples and into the skill.

## End-to-end tests

Playwright tests run against all three examples, in dev and in production builds, using your installed Chrome.

```sh
# once: npm install in each example, then
cd e2e
npm install
npm test
```
