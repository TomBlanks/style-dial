import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { URLS } from "../playwright.config";

const DEV = [
  { name: "plain HTML", url: URLS.html, tokensFile: "tokens.css" },
  { name: "Vite + Tailwind (dev)", url: URLS.viteDev, tokensFile: "src/index.css" },
  { name: "Next.js + Tailwind (dev)", url: URLS.nextDev, tokensFile: "app/globals.css" },
];
const PROD = [
  { name: "Vite + Tailwind (production build)", url: URLS.vitePreview },
  { name: "Next.js + Tailwind (production build)", url: URLS.nextStart },
];

const panel = (page: Page) => page.locator("design-tweaker-root");
const inPanel = (page: Page, sel: string) => page.locator(`design-tweaker-root ${sel}`);

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(panel(page)).toHaveCount(1);
}

/** Heading 1's slider is the second range input in every example config. */
async function nudgeHeading1(page: Page, steps: number) {
  const slider = inPanel(page, 'input[type="range"]').nth(1);
  await slider.focus();
  for (let i = 0; i < steps; i++) await page.keyboard.press("ArrowRight");
}

const h1Size = (page: Page) => page.locator("h1").evaluate((e) => parseFloat(getComputedStyle(e).fontSize));

for (const ex of DEV) {
  test.describe(ex.name, () => {
    test("panel mounts in development, with no console errors from the panel", async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (m) => { if (m.text().includes("[design-tweaker]")) problems.push(m.text()); });
      page.on("pageerror", (e) => problems.push(e.message));
      await open(page, ex.url);
      await expect(inPanel(page, '[role="tab"]', ).filter({ hasText: "Controls" })).toBeVisible();
      expect(problems).toEqual([]); // includes "config out of date" and "mount() called twice"
    });

    test("a slider changes the page", async ({ page }) => {
      await open(page, ex.url);
      const before = await h1Size(page);
      await nudgeHeading1(page, 4);
      await expect.poll(() => h1Size(page)).toBeGreaterThan(before);
    });

    test("Copy changes produces the exact design-tweaks block", async ({ page }) => {
      await open(page, ex.url);
      const h1 = inPanel(page, ".num input").nth(1);
      const start = parseFloat(await h1.inputValue());
      await nudgeHeading1(page, 2); // Heading 1 steps are 0.125rem
      await inPanel(page, ".copy").click();
      await expect(inPanel(page, ".toast")).toHaveText("Copied — paste it into Claude Code");
      const text = await page.evaluate(() => navigator.clipboard.readText());
      expect(text).toBe([
        "```design-tweaks",
        "Apply these design tweaks (design-tweaker v1)",
        "version: A",
        `tokens-file: ${ex.tokensFile}`,
        `--text-h1: ${start + 0.25}rem;`,
        "```",
      ].join("\n"));
    });

    test("a reload keeps tweaks, versions and the active version", async ({ page }) => {
      await open(page, ex.url);
      await nudgeHeading1(page, 3);
      await inPanel(page, '[aria-label="Try a new version"]').click();
      await nudgeHeading1(page, 3);
      const b = await h1Size(page);
      await page.waitForTimeout(400); // saves are debounced by 300ms
      await page.reload();
      await expect(panel(page)).toHaveCount(1);
      await expect(inPanel(page, '.versions [aria-selected="true"]')).toHaveText("B");
      await expect.poll(() => h1Size(page)).toBe(b);
      await inPanel(page, ".versions [role=tab]").filter({ hasText: /^A/ }).click();
      await expect.poll(() => h1Size(page)).toBeLessThan(b);
    });
  });
}

for (const ex of PROD) {
  test(`${ex.name}: the panel is absent (no element, no code, no config)`, async ({ page }) => {
    const scripts: string[] = [];
    page.on("response", async (r) => {
      if (/javascript/.test(r.headers()["content-type"] ?? "")) scripts.push(await r.text().catch(() => ""));
    });
    await page.goto(ex.url);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible();
    await expect(panel(page)).toHaveCount(0);
    expect(await page.evaluate(() => "TweakPanel" in window)).toBe(false);
    expect(scripts.length).toBeGreaterThan(0);
    for (const js of scripts) {
      expect(js).not.toContain("design-tweaker-root");
      expect(js).not.toContain("Apply these design tweaks");
    }
  });
}

test("updating a config default (as Claude would) clears the matching override after reload", async ({ page }) => {
  // Use the plain-HTML example and rewrite its HTML + tokens.css on the fly, as if Claude had applied the tweak.
  const html = await readFile("../examples/plain-html/index.html", "utf8");
  const css = await readFile("../examples/plain-html/tokens.css", "utf8");
  await open(page, URLS.html);
  const h1 = inPanel(page, ".num input").nth(1);
  await nudgeHeading1(page, 2); // 3.5rem → 3.75rem
  await expect(h1).toHaveValue("3.75");
  await expect(inPanel(page, ".copy")).toHaveText("Copy 1 change");
  await page.waitForTimeout(400);

  await page.route(URLS.html, (r) => r.fulfill({ contentType: "text/html", body: html.replace('"default": 3.5, "min": 1.75', '"default": 3.75, "min": 1.75') }));
  await page.route("**/tokens.css", (r) => r.fulfill({ contentType: "text/css", body: css.replace("--text-h1: 3.5rem;", "--text-h1: 3.75rem;") }));
  await page.reload();

  await expect(panel(page)).toHaveCount(1);
  await expect(inPanel(page, ".num input").nth(1)).toHaveValue("3.75");
  await expect(inPanel(page, ".copy")).toHaveText("Copy changes"); // 0 changes: the override is gone
  await expect(inPanel(page, ".badge")).toBeHidden();
  expect(await page.locator("#design-tweaker-overrides").evaluate((e) => e.textContent ?? "").catch(() => "")).toBe("");
});
