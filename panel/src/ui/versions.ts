// Top row: Original · A · B · C tabs, the + button, and the delete confirmation (spec §6.10).

import type { Store, VersionId, ViewId } from "../state/store";
import { h, svg } from "./dom";
import { ICONS } from "./icons";

export function buildVersionBar(store: Store, trailing: HTMLElement) {
  const list = h("div", { class: "seg versions", role: "tablist", "aria-label": "Versions" });
  const add = h("button", {
    type: "button", class: "icon-btn add", "aria-label": "Try a new version", "data-tip": "Try a new version",
    onclick: () => {
      const id = store.createVersion();
      if (id) focusTab(id);
    },
  }, svg(ICONS.plus));
  const row = h("div", { class: "top" }, list, add, h("span", { class: "spacer" }), trailing);

  // Delete confirmation replaces the row while it's open.
  let deleting: VersionId | null = null;
  const confirmText = h("span", { class: "confirm-text" });
  const cancel = h("button", { type: "button", class: "btn", text: "Cancel", onclick: () => closeConfirm() });
  const confirmDelete = h("button", {
    type: "button", class: "btn danger", text: "Delete",
    onclick: () => {
      const id = deleting!;
      closeConfirm(false);
      store.deleteVersion(id);
      focusTab(store.getState().active);
    },
  });
  const confirmRow = h("div", { class: "top confirm-row", hidden: true, role: "group", "aria-label": "Confirm delete" },
    confirmText, cancel, confirmDelete);
  confirmRow.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.stopPropagation(); closeConfirm(); }
  });

  function askDelete(id: VersionId) {
    const n = store.changesFor(store.getState().versions[id]!).length;
    deleting = id;
    confirmText.replaceChildren(
      h("strong", { text: `Delete Version ${id}?` }), " ",
      h("span", { text: n ? `Its ${n} change${n === 1 ? "" : "s"} will be lost.` : "It has no changes." }),
    );
    row.hidden = true;
    confirmRow.hidden = false;
    cancel.focus();
  }

  function closeConfirm(refocus = true) {
    const id = deleting;
    deleting = null;
    row.hidden = false;
    confirmRow.hidden = true;
    if (refocus && id) focusTab(id);
  }

  const tabs = new Map<ViewId, HTMLButtonElement>();
  const dots = new Map<VersionId, HTMLElement>();
  const removers = new Map<VersionId, HTMLButtonElement>();
  let builtFor = "";

  function focusTab(id: ViewId) {
    tabs.get(id)?.focus();
  }

  function build(ids: ViewId[]) {
    tabs.clear(); dots.clear(); removers.clear();
    list.replaceChildren(...ids.map((id) => {
      const tab = h("button", {
        type: "button", role: "tab", class: "vtab-btn", onclick: () => store.view(id),
        ...(id === "original" ? {} : { "aria-keyshortcuts": "Delete" }),
      }, id === "original" ? "Original" : id);
      tabs.set(id, tab);
      if (id === "original") return tab;

      const dot = h("span", { class: "dot", "aria-hidden": "true" });
      tab.appendChild(dot);
      dots.set(id, dot);
      const remove = h("button", {
        type: "button", class: "vtab-x", "aria-label": `Delete Version ${id}`, tabIndex: -1,
        onclick: (e: Event) => { e.stopPropagation(); askDelete(id); },
      }, svg(ICONS.close));
      removers.set(id, remove);
      return h("span", { class: "vtab" }, tab, remove);
    }));
  }

  list.addEventListener("keydown", (e) => {
    const ids = [...tabs.keys()];
    const active = (list.getRootNode() as ShadowRoot).activeElement;
    const current = ids.findIndex((id) => tabs.get(id) === active);
    if (current < 0) return;
    const id = ids[current];
    if ((e.key === "Delete" || e.key === "Backspace") && id !== "original" && store.versionIds().length > 1) {
      e.preventDefault();
      askDelete(id);
      return;
    }
    let next = -1;
    if (e.key === "ArrowRight") next = (current + 1) % ids.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + ids.length) % ids.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ids.length - 1;
    if (next < 0) return;
    e.preventDefault();
    store.view(ids[next]);
    focusTab(ids[next]);
  });

  return {
    row,
    confirmRow,
    /** Switches with Alt+Shift+1 (Original), 2 (A), 3 (B), 4 (C) while focus is inside the panel. */
    shortcut(e: KeyboardEvent): boolean {
      if (!e.altKey || !e.shiftKey || e.metaKey || e.ctrlKey) return false;
      const m = /^Digit([1-4])$/.exec(e.code);
      if (!m) return false;
      const target = (["original", "A", "B", "C"] as const)[Number(m[1]) - 1] as ViewId;
      if (target !== "original" && !store.getState().versions[target]) return false;
      store.view(target);
      focusTab(target);
      return true;
    },
    render() {
      const state = store.getState();
      const ids: ViewId[] = ["original", ...store.versionIds()];
      const key = ids.join();
      if (key !== builtFor) { build(ids); builtFor = key; }
      const deletable = ids.length > 2;
      for (const [id, tab] of tabs) {
        const on = id === state.active;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
      }
      for (const [id, dot] of dots) dot.hidden = store.changesFor(state.versions[id]!).length === 0;
      for (const [id, x] of removers) {
        const show = deletable && id === state.active;
        x.hidden = !show;
        x.parentElement!.classList.toggle("deletable", show);
      }
      add.hidden = !store.canCreateVersion();
      if (deleting && !state.versions[deleting]) closeConfirm(false);
    },
  };
}
