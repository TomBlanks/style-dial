# Installing the panel

The panel is `assets/tweak-panel.js` in this skill's folder: a single, dependency-free file. **Copy it byte for byte** (e.g. `cp`); never retype, reformat, minify or edit it. For TypeScript projects also copy `assets/tweak-panel.d.ts`, which declares `window.TweakPanel`.

Everything you add to the project's own files goes between `style-dial:start` and `style-dial:end` markers, so it can be removed cleanly later.

## Plain HTML/CSS

1. Tokens in `tokens.css`, linked **first** in `<head>` (before any other stylesheet).
2. Copy `tweak-panel.js` into the project root (or a `dev/` folder).
3. At the very end of `<body>` on **every page**:
   ```html
   <!-- style-dial:start -->
   <script type="application/json" id="tweak-config">{ …the config… }</script>
   <script src="tweak-panel.js"></script>
   <!-- style-dial:end -->
   ```
   The panel finds `#tweak-config` and mounts itself. With several pages, use the same config (same `id`) on each so tweaks carry across pages.
4. There's no dev/production split for plain HTML, so the panel stays until the user says the design is final.

## React (Vite)

1. Tokens per the contract (`@theme static` in `src/index.css` for Tailwind, or `src/styles/tokens.css` imported once in `main.tsx`).
2. Copy `tweak-panel.js` and `tweak-panel.d.ts` into `src/dev/`, and write `src/dev/tweak.config.json`.
3. In `src/main.tsx` (or `main.jsx`), **after** rendering the app:
   ```ts
   // style-dial:start
   if (import.meta.env.DEV) {
     Promise.all([
       import("./dev/tweak-panel.js"),
       import("./dev/tweak.config.json"),
     ]).then(([, config]) => window.TweakPanel.mount(config.default));
   }
   // style-dial:end
   ```
4. TypeScript: make sure the tsconfig that covers `src` has `"resolveJsonModule": true`.
5. Vite removes the `import.meta.env.DEV` block from production builds, so no panel code ships. Run `npm run build` to confirm it still passes.

## Next.js (App Router)

1. Tokens per the contract (`@theme static` in `app/globals.css` for Tailwind, or `app/tokens.css` imported in `app/layout.tsx`).
2. Copy `tweak-panel.js` and `tweak-panel.d.ts` into `app/dev/`, and write `app/dev/tweak.config.json`. (`app/dev/` has no `page.tsx`, so it doesn't become a route.)
3. Create `app/dev/DevTweakPanel.tsx` exactly like this:
   ```tsx
   "use client";
   import { useEffect } from "react";
   // Imported statically so that when the config changes (e.g. Claude applied your tweaks), Fast Refresh
   // re-runs this component and the panel remounts with the new defaults. This file is only loaded in development.
   import config from "./tweak.config.json";

   export default function DevTweakPanel() {
     useEffect(() => {
       // React runs effects twice in development (Strict Mode); skip a mount whose effect was already cleaned up.
       let cancelled = false;
       import("./tweak-panel.js").then(() => { if (!cancelled) window.TweakPanel.mount(config); });
       return () => { cancelled = true; window.TweakPanel?.unmount(); };
     }, [config]); // a new config (after an edit) remounts the panel with the new defaults
     return null;
   }
   ```
4. In `app/layout.tsx`, make the layout `async` and import the component **only in development**. Don't add a top-level `import` for it: a top-level import ships the whole panel and config in production chunks even though they're never rendered.
   ```tsx
   export default async function RootLayout({ children }: { children: React.ReactNode }) {
     // style-dial:start
     const DevTweakPanel = process.env.NODE_ENV === "development" ? (await import("./dev/DevTweakPanel")).default : null;
     // style-dial:end
     return (
       <html lang="en">
         <body>
           {children}
           {/* style-dial:start */}
           {DevTweakPanel && <DevTweakPanel />}
           {/* style-dial:end */}
         </body>
       </html>
     );
   }
   ```
5. The panel mounts after hydration, outside the React tree, so there are no hydration warnings. Run `npm run build` to confirm it still passes.

## Fonts

The panel doesn't load or switch fonts. Load the one pair you chose (see `font-pairs.md`):
- **Plain HTML / Vite:** a Google Fonts `<link>` in `<head>` (or `@fontsource` packages if the project already uses them).
- **Next.js:** `next/font/google`, with the font's `variable` wired into `--font-heading` / `--font-body`.

## After installing

Start the dev server (or open the HTML file) and check: the panel's round button is in the bottom-right corner, ⌥⇧T opens it, and dragging a slider changes the page. If the browser console shows `[style-dial] Config out of date: …`, a config `default` doesn't match the tokens file; fix the config.
