// Suggestions tab (spec §6.7, with the flow agreed in the M1.3 mockup — see DECISIONS.md):
//   Preview → (Cancel | Apply) → ✓ Applied (click to undo it) → leaves the list once changes are copied.

import type { Suggestion } from "../config/types";
import type { Store, VersionId } from "../state/store";
import { sameValue, type Values } from "../state/values";
import { h, svg } from "./dom";
import { ICONS } from "./icons";

export function buildSuggestionsPanel(store: Store) {
  const { config } = store;
  const labels = new Map(config.tokens.map((t) => [t.var, t.label]));

  // In memory only: values just before each Apply (for un-applying), and which applied
  // suggestions have been copied (hidden from that version's list).
  const before = new Map<VersionId, Map<string, Values>>();
  const copied = new Map<VersionId, Set<string>>();

  const list = h("ul", { class: "list suggestions" });
  const empty = h("div", { class: "empty" });
  const el = h("div", null, empty, list);

  const isApplied = (s: Suggestion, values: Values) =>
    Object.entries(s.changes).every(([k, v]) => sameValue(values[k], v));

  function apply(s: Suggestion, version: VersionId) {
    const current = store.getState().versions[version]!;
    const prior: Values = {};
    for (const k of Object.keys(s.changes)) prior[k] = current[k];
    if (!before.has(version)) before.set(version, new Map());
    before.get(version)!.set(s.id, prior);
    store.apply(s.changes);
  }

  function unapply(s: Suggestion, version: VersionId) {
    // After a reload the pre-Apply values aren't known, so fall back to the original design's values.
    const prior = before.get(version)?.get(s.id) ?? pick(store.getState().defaults, Object.keys(s.changes));
    before.get(version)?.delete(s.id);
    store.apply(prior);
  }

  function card(s: Suggestion, version: VersionId, applied: boolean, previewing: boolean) {
    const titleId = `dt-sug-${s.id}`;
    let actions: HTMLElement;
    if (applied) {
      actions = h("button", {
        type: "button", class: "applied-tag", "aria-label": `Applied: ${s.title}. Click to undo it.`, "data-tip": "Click to undo",
        "data-tip-pos": "start", onclick: () => unapply(s, version),
      }, svg(ICONS.check), "Applied");
    } else if (previewing) {
      actions = h("span", { class: "actions" },
        h("button", { type: "button", class: "btn", text: "Cancel", onclick: () => store.setPreview(null) }),
        h("button", { type: "button", class: "btn primary", text: "Apply", onclick: () => apply(s, version) }),
      );
    } else {
      actions = h("button", {
        type: "button", class: "btn", text: "Preview", "aria-describedby": titleId,
        onclick: () => store.setPreview({ id: s.id, changes: s.changes }),
      });
    }
    return h("li", { class: `sug${previewing ? " previewing" : ""}${applied ? " applied" : ""}`, "data-id": s.id },
      h("h3", { id: titleId, text: s.title }),
      s.reason ? h("p", { text: s.reason }) : null,
      h("div", { class: "what", "aria-label": "Changes" },
        ...Object.keys(s.changes).map((k) => h("span", { class: "chip", text: labels.get(k) ?? k }))),
      h("div", { class: "sug-actions" }, actions),
    );
  }

  return {
    el,
    /** Called after "Copy changes": applied suggestions leave this version's list. */
    copied(version: VersionId) {
      const values = store.getState().versions[version]!;
      const set = copied.get(version) ?? new Set<string>();
      for (const s of config.suggestions) if (isApplied(s, values)) set.add(s.id);
      copied.set(version, set);
    },
    render() {
      const state = store.getState();
      if (state.active === "original") {
        list.replaceChildren();
        list.hidden = true;
        empty.hidden = false;
        empty.textContent = "Suggestions are tried on a version. Pick a version to preview them.";
        return;
      }
      const version = state.active;
      const values = state.versions[version]!;
      const hidden = copied.get(version) ?? new Set<string>();
      const shown = config.suggestions.filter((s) => {
        if (!hidden.has(s.id)) return true;
        if (isApplied(s, values)) return false;
        hidden.delete(s.id); // no longer applied (undo or a manual edit): it comes back
        return true;
      });
      list.hidden = shown.length === 0;
      empty.hidden = shown.length > 0;
      empty.textContent = config.suggestions.length ? "No suggestions left for this version." : "No suggestions for this design.";

      // Keep focus on the same card across re-renders (the buttons inside are replaced).
      const root = el.getRootNode() as ShadowRoot | Document;
      const focusedCard = (root.activeElement as HTMLElement | null)?.closest?.(".sug")?.getAttribute("data-id");
      list.replaceChildren(...shown.map((s) => card(s, version, isApplied(s, values), state.preview?.id === s.id)));
      if (focusedCard) {
        const btn = list.querySelector<HTMLButtonElement>(`.sug[data-id="${CSS.escape(focusedCard)}"] button:last-of-type`);
        btn?.focus();
      }
    },
  };
}

function pick(values: Values, keys: string[]): Values {
  const out: Values = {};
  for (const k of keys) out[k] = values[k];
  return out;
}
