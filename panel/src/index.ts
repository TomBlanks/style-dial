// Entry point. The UI arrives in M1.4; for now mount only validates the config.
import { validateConfig } from "./config/validate";
import { findStaleDefaults } from "./config/drift";

const PREFIX = "[design-tweaker]";
let mounted = false;

function mount(input: unknown): void {
  if (mounted) {
    console.warn(`${PREFIX} mount() called twice; ignoring.`);
    return;
  }
  const result = validateConfig(input);
  if (!result.ok) {
    console.error(`${PREFIX} ${result.error}`);
    return;
  }
  mounted = true;
  for (const w of result.warnings) console.warn(`${PREFIX} ${w}`);
  const style = getComputedStyle(document.documentElement);
  for (const w of findStaleDefaults(result.config, (n) => style.getPropertyValue(n))) {
    console.warn(`${PREFIX} Config out of date: ${w}`);
  }
}

function unmount(): void {
  mounted = false;
}

window.TweakPanel = { mount, unmount };

const inline = document.getElementById("tweak-config");
if (inline && inline.getAttribute("type") === "application/json") {
  mount(inline.textContent ?? "");
}
