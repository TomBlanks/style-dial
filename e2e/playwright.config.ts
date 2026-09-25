import { defineConfig } from "@playwright/test";

// Ports are fixed so each test can target a specific example and mode.
export const URLS = {
  html: "http://localhost:4300/",
  viteDev: "http://localhost:4310/",
  vitePreview: "http://localhost:4311/",
  nextDev: "http://localhost:4320/",
  nextStart: "http://localhost:4321/",
};

const ex = (name: string) => `../examples/${name}`;

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    channel: "chrome", // the locally installed Chrome; no browser download needed
    viewport: { width: 1280, height: 860 },
    permissions: ["clipboard-read", "clipboard-write"],
  },
  webServer: [
    { command: `node static-server.mjs ${ex("plain-html")} 4300`, url: URLS.html, reuseExistingServer: false },
    { command: `npm --prefix ${ex("react-vite-tailwind")} run dev -- --port 4310 --strictPort`, url: URLS.viteDev, reuseExistingServer: false },
    {
      command: `npm --prefix ${ex("react-vite-tailwind")} run build && npm --prefix ${ex("react-vite-tailwind")} run preview -- --port 4311 --strictPort`,
      url: URLS.vitePreview, reuseExistingServer: false, timeout: 120_000,
    },
    {
      command: `npm --prefix ${ex("nextjs-tailwind")} exec -- next build ${ex("nextjs-tailwind")} && npm --prefix ${ex("nextjs-tailwind")} exec -- next start ${ex("nextjs-tailwind")} --port 4321`,
      url: URLS.nextStart, reuseExistingServer: false, timeout: 180_000,
    },
    // After the production build: `next build` wipes .next, which the dev server also uses.
    { command: `npm --prefix ${ex("nextjs-tailwind")} exec -- next dev ${ex("nextjs-tailwind")} --port 4320`, url: URLS.nextDev, reuseExistingServer: false, timeout: 120_000 },
  ],
});
