// The panel shell: Shadow DOM host, launcher, top row, tabs, body, footer (spec §6.2, §6.4).

import type { Store } from "../state/store";
import { buildControls } from "./controls";
import { buildVersionBar } from "./versions";
import { h, nextId, svg } from "./dom";
import { ICONS } from "./icons";
import { CSS } from "./styles";

export const HOST_TAG = "design-tweaker-root";

export type TabId = "controls" | "checks" | "suggestions";

export interface PanelHandle {
  destroy(): void;
}

/** Creates the host element + shadow root, with the stylesheet and host positioning. */
function createHost(): { host: HTMLElement; shadow: ShadowRoot; root: HTMLElement } {
  const host = document.createElement(HOST_TAG);
  // Inline + !important so site rules like `* { position: relative }` can't move the panel.
  host.style.setProperty("position", "fixed", "important");
  host.style.setProperty("z-index", "2147483000", "important");
  host.style.setProperty("display", "block", "important");
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = CSS;
  const root = h("div", { class: "root" });
  shadow.append(style, root);
  document.body.appendChild(host);
  return { host, shadow, root };
}

/** WAI-ARIA tabs: click or arrow keys select; only the selected tab is in the tab order. */
function tablist<T extends string>(
  label: string,
  className: string,
  items: { id: T; content: (string | Node)[] }[],
  onSelect: (id: T) => void,
) {
  const buttons = new Map<T, HTMLButtonElement>();
  const list = h("div", { class: `seg ${className}`, role: "tablist", "aria-label": label });
  for (const item of items) {
    const b = h("button", { type: "button", role: "tab", id: nextId("tab"), onclick: () => onSelect(item.id) }, ...item.content);
    buttons.set(item.id, b);
    list.appendChild(b);
  }
  list.addEventListener("keydown", (e) => {
    const ids = [...buttons.keys()];
    const current = ids.findIndex((id) => buttons.get(id) === (list.getRootNode() as ShadowRoot).activeElement);
    if (current < 0) return;
    let next = -1;
    if (e.key === "ArrowRight") next = (current + 1) % ids.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + ids.length) % ids.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ids.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onSelect(ids[next]);
    buttons.get(ids[next])!.focus();
  });
  return {
    el: list,
    buttons,
    select(id: T) {
      for (const [key, b] of buttons) {
        const on = key === id;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
      }
    },
  };
}

function launcherButton(onOpen: () => void) {
  const badge = h("span", { class: "badge", hidden: true });
  const button = h("button", { type: "button", class: "launcher", onclick: onOpen }, svg(ICONS.sliders), badge);
  return { button, badge };
}

/** Toggles open/closed with the button, the minimise control and Alt+Shift+T; moves focus sensibly. */
function wireCollapse(launcher: HTMLButtonElement, win: HTMLElement, focusOnOpen: () => HTMLElement) {
  let expanded = true;
  const set = (open: boolean, moveFocus: boolean) => {
    expanded = open;
    win.hidden = !open;
    launcher.hidden = open;
    if (moveFocus) (open ? focusOnOpen() : launcher).focus();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === "KeyT") {
      e.preventDefault();
      set(!expanded, true);
    }
  };
  window.addEventListener("keydown", onKey);
  return { set, isExpanded: () => expanded, dispose: () => window.removeEventListener("keydown", onKey) };
}

export function mountPanel(store: Store): PanelHandle {
  const { host, root } = createHost();
  const config = store.config;
  let tab: TabId = "controls";

  // Top row: versions · + · minimise.
  const minimise = h("button", {
    type: "button", class: "icon-btn", "aria-label": "Minimise Design Tweaker", "data-tip": "Minimise (⌥⇧T)",
    onclick: () => collapse.set(false, true),
  }, svg(ICONS.minimise));
  const versions = buildVersionBar(store, minimise);

  // Section tabs and their panels.
  const checksCount = h("span", { class: "count", hidden: true });
  const tabs = tablist<TabId>(
    "Sections",
    "tabs",
    [
      { id: "controls", content: ["Controls"] },
      { id: "checks", content: ["Checks", checksCount] },
      { id: "suggestions", content: ["Suggestions"] },
    ],
    (id) => { tab = id; render(); },
  );
  const controls = buildControls(config.tokens, {
    set: (name, value) => store.set(name, value),
    commit: () => store.commit(),
  });
  const panels: Record<TabId, HTMLElement> = {
    controls: controls.el,
    checks: h("div", { class: "empty", text: "Design checks arrive in milestone M3." }),
    suggestions: h("div", { class: "empty", text: "Suggestions arrive in milestone M4." }),
  };
  for (const id of Object.keys(panels) as TabId[]) {
    const b = tabs.buttons.get(id)!;
    const p = panels[id];
    p.id = nextId("tabpanel");
    p.setAttribute("role", "tabpanel");
    p.setAttribute("aria-labelledby", b.id);
    p.tabIndex = -1;
    b.setAttribute("aria-controls", p.id);
  }
  const body = h("div", { class: "body" }, ...Object.values(panels));

  // Footer. Copying is wired up in M2.3.
  const mod = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl+";
  const undo = h("button", { type: "button", class: "icon-btn", "aria-label": "Undo", "data-tip": `Undo (${mod}Z)`, "data-tip-pos": "start", onclick: () => store.undo() }, svg(ICONS.undo));
  const redo = h("button", { type: "button", class: "icon-btn", "aria-label": "Redo", "data-tip": `Redo (${mod}${mod === "⌘" ? "⇧" : "Shift+"}Z)`, onclick: () => store.redo() }, svg(ICONS.redo));
  const resetAll = h("button", { type: "button", class: "icon-btn", "aria-label": "Reset all", "data-tip": "Reset all", onclick: () => confirmReset(true) }, svg(ICONS.resetAll));
  const copy = h("button", { type: "button", class: "btn primary copy", disabled: true });
  const actionsRow = h("div", { class: "footer-row" },
    undo, redo, resetAll, h("span", { class: "spacer" }), copy);
  const cancelReset = h("button", { type: "button", class: "btn", text: "Cancel", onclick: () => confirmReset(false, true) });
  const confirmRow = h("div", { class: "footer-row confirm-row", hidden: true, role: "group", "aria-label": "Confirm reset" },
    h("span", { class: "confirm-text", text: "Reset this version to the original?" }),
    cancelReset,
    h("button", { type: "button", class: "btn primary", text: "Reset", onclick: () => { store.resetAll(); confirmReset(false, true); } }),
  );
  confirmRow.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); confirmReset(false, true); } });
  const originalNote = h("div", { class: "note", hidden: true }, svg(ICONS.info), "Showing the original design. Pick a version to edit.");
  const footer = h("footer", { class: "footer" }, actionsRow, confirmRow, originalNote);

  let confirming = false;
  function confirmReset(on: boolean, restoreFocus = false) {
    confirming = on;
    render();
    if (on) cancelReset.focus();
    else if (restoreFocus) (resetAll.disabled ? undo : resetAll).focus(); // after Reset, Undo is the natural next step
  }

  const win = h("section", { class: "win", "aria-label": "Design Tweaker" },
    versions.row, versions.confirmRow, tabs.el, body, footer);

  // Undo / redo shortcuts, only while focus is inside the panel. Text fields keep their own undo.
  win.addEventListener("keydown", (e) => {
    if (versions.shortcut(e)) { e.preventDefault(); return; }
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.code !== "KeyZ") return;
    const target = e.composedPath()[0] as HTMLElement;
    if (target instanceof HTMLInputElement && target.type === "text") return;
    e.preventDefault();
    if (e.shiftKey) store.redo();
    else store.undo();
  });
  const launcher = launcherButton(() => collapse.set(true, true));
  root.append(launcher.button, win);
  const collapse = wireCollapse(launcher.button, win, () => minimise);
  collapse.set(true, false);

  function render() {
    const state = store.getState();
    const isOriginal = state.active === "original";
    const changes = store.changes().length;

    versions.render();

    tabs.select(tab);
    for (const id of Object.keys(panels) as TabId[]) panels[id].hidden = id !== tab;
    controls.update(store.shownValues(), state.defaults, isOriginal);

    if (isOriginal || changes === 0) confirming = false;
    actionsRow.hidden = isOriginal || confirming;
    confirmRow.hidden = isOriginal || !confirming;
    originalNote.hidden = !isOriginal;
    undo.disabled = !store.canUndo();
    redo.disabled = !store.canRedo();
    resetAll.disabled = changes === 0;
    copy.textContent = changes === 0 ? "Copy changes" : `Copy ${changes} change${changes === 1 ? "" : "s"}`;

    launcher.badge.hidden = changes === 0;
    launcher.badge.textContent = String(changes);
    launcher.button.setAttribute("aria-label", `Open Design Tweaker${changes ? ` (${changes} unsaved change${changes === 1 ? "" : "s"})` : ""}`);
  }

  const stop = store.subscribe(render);
  render();

  return {
    destroy() {
      stop();
      collapse.dispose();
      host.remove();
    },
  };
}

/** Fatal config error: the panel shows the message and no controls (spec §5.3). */
export function mountError(message: string): PanelHandle {
  const { host, root } = createHost();
  const minimise = h("button", {
    type: "button", class: "icon-btn", "aria-label": "Minimise Design Tweaker", "data-tip": "Minimise (⌥⇧T)",
    onclick: () => collapse.set(false, true),
  }, svg(ICONS.minimise));
  const win = h("section", { class: "win", "aria-label": "Design Tweaker", style: "height:auto;min-height:0" },
    h("div", { class: "top" }, h("strong", { text: "Design Tweaker" }), h("span", { class: "spacer" }), minimise),
    h("div", { class: "body error-msg", role: "alert" },
      h("strong", { text: "The tweak config couldn't be loaded." }),
      h("code", { text: message }),
      h("span", { text: "Fix tweak.config.json and reload the page." }),
    ),
  );
  const launcher = launcherButton(() => collapse.set(true, true));
  launcher.badge.hidden = false;
  launcher.badge.classList.add("error");
  launcher.badge.textContent = "!";
  launcher.button.setAttribute("aria-label", "Open Design Tweaker (config error)");
  root.append(launcher.button, win);
  const collapse = wireCollapse(launcher.button, win, () => minimise);
  collapse.set(true, false);
  return { destroy() { collapse.dispose(); host.remove(); } };
}
