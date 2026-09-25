// Builds the panel into one dependency-free IIFE and copies it into the skill.
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "dist/tweak-panel.js");
const assets = resolve(here, "../skill/design-tweaker/assets");
// Every example gets the freshly built panel (the skill's assets are the source of truth).
const examples = [
  { dir: resolve(here, "../examples/plain-html"), types: false },
  { dir: resolve(here, "../examples/react-vite-tailwind/src/dev"), types: true },
  { dir: resolve(here, "../examples/nextjs-tailwind/app/dev"), types: true },
];
const BUDGET = 30 * 1024;

await build({
  entryPoints: [resolve(here, "src/index.ts")],
  outfile: out,
  bundle: true,
  format: "iife",
  target: "es2020",
  minify: true,
  legalComments: "none",
  banner: { js: "/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */" },
});

mkdirSync(assets, { recursive: true });
copyFileSync(out, resolve(assets, "tweak-panel.js"));
copyFileSync(resolve(here, "src/tweak-panel.d.ts"), resolve(assets, "tweak-panel.d.ts"));
for (const { dir, types } of examples) {
  mkdirSync(dir, { recursive: true });
  copyFileSync(out, resolve(dir, "tweak-panel.js"));
  if (types) copyFileSync(resolve(here, "src/tweak-panel.d.ts"), resolve(dir, "tweak-panel.d.ts"));
}

const gz = gzipSync(readFileSync(out)).length;
const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(`tweak-panel.js: ${kb(readFileSync(out).length)} raw, ${kb(gz)} gzipped (budget ${kb(BUDGET)})`);
if (gz > BUDGET) {
  console.error("Bundle is over the 30 KB gzipped budget.");
  process.exit(1);
}
