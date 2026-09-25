// Acceptance criterion (§12): every token exists, is used, and changing it visibly changes the page.
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { URLS } from "../playwright.config";

const EXAMPLES = [
  { name: "plain HTML", url: URLS.html, config: async () => JSON.parse(/id="tweak-config">([\s\S]*?)<\/script>/.exec(await readFile("../examples/plain-html/index.html", "utf8"))![1]) },
  { name: "Vite + Tailwind", url: URLS.viteDev, config: async () => JSON.parse(await readFile("../examples/react-vite-tailwind/src/dev/tweak.config.json", "utf8")) },
  { name: "Next.js + Tailwind", url: URLS.nextDev, config: async () => JSON.parse(await readFile("../examples/nextjs-tailwind/app/dev/tweak.config.json", "utf8")) },
];

const REQUIRED = ["--text-body", "--text-h1", "--text-h2", "--leading-body", "--measure", "--space-section", "--color-fg", "--color-bg", "--color-accent"];

/** A clearly different value for a token: the far end of its range, or an inverted colour. */
function different(t: any): string {
  if (t.type === "color") {
    const n = parseInt(t.default.slice(1), 16) ^ 0xffffff;
    return "#" + n.toString(16).padStart(6, "0");
  }
  const far = Math.abs(t.max - t.default) > Math.abs(t.default - t.min) ? t.max : t.min;
  return far + (t.type === "size" ? t.unit : "");
}

for (const ex of EXAMPLES) {
  test(`${ex.name}: all required tokens exist and every token visibly changes the page`, async ({ page }) => {
    const config = await ex.config();
    const vars = config.tokens.map((t: any) => t.var);
    expect(REQUIRED.filter((v) => !vars.includes(v))).toEqual([]);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(ex.url);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator("design-tweaker-root").waitFor();
    // Hide the panel so only the site is compared, and use a tall viewport to include every section.
    await page.addStyleTag({ content: "design-tweaker-root { display: none !important; }" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: 1280, height: Math.min(height + 200, 6000) });
    await page.waitForTimeout(300);
    const baseline = await page.screenshot();

    const invisible: string[] = [];
    for (const t of config.tokens) {
      const handle = await page.addStyleTag({ content: `:root:root { ${t.var}: ${different(t)} !important; }` });
      await page.waitForTimeout(50);
      const shot = await page.screenshot();
      if (shot.equals(baseline)) invisible.push(`${t.var} → ${different(t)}`);
      await handle.evaluate((el) => el.remove());
    }
    expect(invisible, "tokens that changed nothing on the page").toEqual([]);
  });
}
