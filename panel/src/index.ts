// Entry point: exposes window.TweakPanel and auto-mounts from an inline #tweak-config.
import { validateConfig } from "./config/validate";
import { findStaleDefaults } from "./config/drift";
import { OverrideWriter, buildOverrideCss } from "./overrides";
import { Store } from "./state/store";
import { mountError, mountPanel, type PanelHandle } from "./ui/panel";

const PREFIX = "[design-tweaker]";

let mounted: { panel: PanelHandle; writer?: OverrideWriter; stop?: () => void } | null = null;

function mount(input: unknown): void {
  if (mounted) {
    console.warn(`${PREFIX} mount() called twice; ignoring.`);
    return;
  }
  const result = validateConfig(input);
  if (!result.ok) {
    console.error(`${PREFIX} ${result.error}`);
    mounted = { panel: mountError(result.error) };
    return;
  }
  const { config, warnings } = result;
  for (const w of warnings) console.warn(`${PREFIX} ${w}`);
  const style = getComputedStyle(document.documentElement);
  for (const w of findStaleDefaults(config, (n) => style.getPropertyValue(n))) {
    console.warn(`${PREFIX} Config out of date: ${w}`);
  }

  const store = new Store(config);
  const writer = new OverrideWriter();
  const stop = store.subscribe(() =>
    writer.write(buildOverrideCss(config, store.shownValues(), store.getState().defaults)),
  );
  mounted = { panel: mountPanel(store), writer, stop };
}

function unmount(): void {
  if (!mounted) return;
  mounted.stop?.();
  mounted.writer?.remove();
  mounted.panel.destroy();
  mounted = null;
}

window.TweakPanel = { mount, unmount };

function autoMount() {
  const inline = document.getElementById("tweak-config");
  if (inline && inline.getAttribute("type") === "application/json") mount(inline.textContent ?? "");
}
// The script tag sits at the end of <body>, but be safe if it's loaded earlier.
if (document.body) autoMount();
else document.addEventListener("DOMContentLoaded", autoMount, { once: true });
