// Acceptance criterion (§12): the panel is keyboard operable and meets WCAG AA contrast itself.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { URLS } from "../playwright.config";

const inPanel = (page: Page, sel: string) => page.locator(`design-tweaker-root ${sel}`);

async function scan(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .include("design-tweaker-root")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const problems = results.violations.map((v) => `${label}: ${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes[0].target.join(" ")} ${v.nodes[0].failureSummary?.split("\n")[1] ?? ""}`);
  return problems;
}

for (const scheme of ["light", "dark"] as const) {
  test(`axe finds no WCAG A/AA problems in the panel (${scheme} mode), across tabs and states`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.goto(URLS.html);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await inPanel(page, ".win").waitFor();
    // Put the panel into a busy state: changes, a second version, and check warnings.
    const slider = inPanel(page, 'input[type="range"]').nth(1);
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await inPanel(page, ".hex").nth(1).fill("#c9c3bc");
    await page.keyboard.press("Enter");
    await inPanel(page, '[aria-label="Try a new version"]').click();

    const problems: string[] = [];
    problems.push(...await scan(page, "Controls"));
    await inPanel(page, ".tabs [role=tab]").nth(1).click();
    await page.waitForTimeout(150);
    expect(await inPanel(page, ".check").count()).toBeGreaterThan(0);
    problems.push(...await scan(page, "Checks"));
    await inPanel(page, ".tabs [role=tab]").nth(2).click();
    await inPanel(page, ".sug button").first().click(); // previewing: Cancel + Apply
    problems.push(...await scan(page, "Suggestions (previewing)"));
    await inPanel(page, ".sug .btn.primary").first().click(); // ✓ Applied
    problems.push(...await scan(page, "Suggestions (applied)"));
    await inPanel(page, ".versions [role=tab]").nth(2).focus();
    await page.keyboard.press("Delete");
    problems.push(...await scan(page, "Delete confirmation"));
    await page.keyboard.press("Escape");
    await inPanel(page, ".versions [role=tab]").first().click();
    problems.push(...await scan(page, "Original view"));
    await inPanel(page, '[aria-label="Minimise Design Tweaker"]').click();
    problems.push(...await scan(page, "Minimised"));
    expect(problems).toEqual([]);
  });
}

test("the whole panel is keyboard operable, with a visible focus indicator", async ({ page }) => {
  await page.goto(URLS.html);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await inPanel(page, ".win").waitFor();

  // Alt+Shift+T minimises and restores, moving focus sensibly.
  await page.keyboard.press("Alt+Shift+KeyT");
  await expect(inPanel(page, ".launcher")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(inPanel(page, '[aria-label="Minimise Design Tweaker"]')).toBeFocused();

  // Make a change first so Undo, Reset all and Copy are enabled (disabled buttons rightly skip focus).
  await inPanel(page, 'input[type="range"]').first().focus();
  await page.keyboard.press("ArrowRight");

  // Tab through everything; record what receives focus and check each has a visible outline or ring.
  const seen: string[] = [];
  const noIndicator: string[] = [];
  await inPanel(page, ".versions [role=tab][aria-selected=true]").focus();
  for (let i = 0; i < 150; i++) {
    const info = await page.evaluate((n) => {
      const el = document.querySelector("design-tweaker-root")!.shadowRoot!.activeElement as HTMLElement | null;
      if (!el) return null;
      if (el.dataset.walk) return { repeat: true } as const;
      el.dataset.walk = String(n);
      const cs = getComputedStyle(el);
      const ring = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
      const box = el.closest(".num") ?? el;
      const shadowRing = getComputedStyle(box).boxShadow.includes("2px");
      const thumbRing = el.matches("input[type=range]"); // styled via ::-webkit-slider-thumb focus ring
      const name = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 24) || el.getAttribute("type") || el.tagName;
      return { repeat: false, key: `${el.tagName.toLowerCase()}:${name}`, visible: ring || shadowRing || thumbRing } as const;
    }, i);
    if (!info || info.repeat) break;
    seen.push(info.key);
    if (!info.visible) noIndicator.push(info.key);
    await page.keyboard.press("Tab");
  }
  const joined = seen.join(" | ");
  for (const needle of ["button:Try a new version", "button:Minimise Design Tweaker", "button:Controls", "summary:Typography", "input:range", "input:Heading 1 value in rem", "input:Pick Accent colour", "button:Undo", "button:Reset all", "button:Copy 1 change"]) {
    expect(joined, `expected Tab to reach ${needle}`).toContain(needle);
  }
  expect(noIndicator, "focused elements without a visible focus indicator").toEqual([]);

  // Arrow keys switch section tabs; Enter/Space activate buttons.
  await inPanel(page, ".tabs [role=tab]").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(inPanel(page, ".tabs [role=tab]").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter"); // Preview on the first suggestion
  await expect(inPanel(page, ".sug.previewing")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(inPanel(page, ".sug.previewing")).toHaveCount(0);
});
