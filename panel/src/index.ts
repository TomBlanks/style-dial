// Entry point: exposes window.TweakPanel and auto-mounts from an inline #tweak-config.
import { validateConfig } from "./config/validate";
import { findStaleDefaults } from "./config/drift";
import { OverrideWriter, buildOverrideCss } from "./overrides";
import { Store } from "./state/store";
import type { Value } from "./state/values";

const PREFIX = "[design-tweaker]";

let mounted: { store: Store; writer: OverrideWriter; stop: () => void } | null = null;

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
  mounted = { store, writer, stop };
}

function unmount(): void {
  if (!mounted) return;
  mounted.stop();
  mounted.writer.remove();
  mounted = null;
}

window.TweakPanel = { mount, unmount };

// TEMPORARY (M1.2 only): lets you drive the store from the console until the UI exists in M1.4.
Object.assign(window.TweakPanel, {
  debug: {
    set: (key: string, value: Value) => mounted?.store.set(key, value),
    values: () => mounted && { ...mounted.store.shownValues() },
    changes: () => mounted?.store.changes(),
  },
});

const inline = document.getElementById("tweak-config");
if (inline && inline.getAttribute("type") === "application/json") {
  mount(inline.textContent ?? "");
}
