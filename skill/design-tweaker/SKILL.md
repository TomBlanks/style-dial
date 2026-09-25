---
name: design-tweaker
description: Builds websites on a design-token contract and installs a live
  tweak panel (sliders, colour pickers, design checks, tailored suggestions and
  A/B/C versions) for fine-tuning during development. Use whenever the user asks
  to design, build, restyle or mock up a website, landing page, portfolio or
  web UI in plain HTML/CSS, React (Vite) or Next.js, even if they don't mention
  a panel. Also use whenever the user pastes a block starting with
  "Apply these design tweaks (design-tweaker v1)", or says the design is final.
---

# Design Tweaker

The user fine-tunes the design in a floating panel, clicks **Copy changes**, and pastes the result back here. Your job is to build sites the panel can drive, and to apply what comes back.

## When building or restyling a site

1. **Detect the project type**: plain HTML, React (Vite) or Next.js (App Router), and whether it uses Tailwind CSS v4.
   - Tailwind v3 (a `tailwind.config.js` with `theme.extend`, or `@tailwind base;`) is not supported. Tell the user and ask whether to continue without the panel.
   - Any other framework (Vue, Svelte, Astro…) isn't supported in v1. Say so and ask before continuing without the panel.
2. **Read `references/token-contract.md`.** Build the site so every adjustable value is a token, using the exact names and roles listed there. Every token you declare must be used by the page.
3. **Read `references/font-pairs.md`.** Choose one heading + body pair that suits the site and set it on `--font-heading` / `--font-body`. The panel doesn't change fonts in v1; you do, on request.
4. **Read `references/suggestion-guide.md`.** Write 3–5 suggestions specific to this design.
5. **Read `references/config-schema.md`** and write the config.
6. **Read `references/framework-setup.md`** and install the panel for this project type. Copy `assets/tweak-panel.js` (and `assets/tweak-panel.d.ts` for React/Next) from this skill's folder **byte for byte**. Never rewrite, reformat or edit it.
7. **Check your work** against the checklist at the end of `references/config-schema.md`.
8. **Tell the user** in one or two sentences: the panel is in the bottom-right corner in development (⌥⇧T toggles it), and **Copy changes** gives them text to paste back here.

## When the user pastes "Apply these design tweaks (design-tweaker v1)"

Follow `references/applying-and-finalising.md`: update only the listed token values in the tokens file, update the matching config defaults, then refresh the suggestions. Don't touch anything else.

## When the user says the design is final

Follow the finalising steps in `references/applying-and-finalising.md`.
