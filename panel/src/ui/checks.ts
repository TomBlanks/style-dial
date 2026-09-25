// Checks tab (spec §6.6): one row per issue with a severity icon, message and optional Fix.

import type { CheckResult } from "../checks/rules";
import type { Values } from "../state/values";
import { h, svg } from "./dom";
import { ICONS } from "./icons";

export function buildChecksPanel(onFix: (fix: Values) => void) {
  const list = h("ul", { class: "list checks" });
  const empty = h("div", { class: "empty", text: "No issues found." });
  const el = h("div", null, empty, list);

  return {
    el,
    update(results: CheckResult[], readOnly: boolean) {
      empty.hidden = results.length > 0;
      list.hidden = results.length === 0;

      // Re-rendering removes the focused Fix button, which would drop focus out of the panel
      // (and with it ⌘Z). Move it to the same check if it's still there, else the next Fix, else the tab.
      const root = el.getRootNode() as ShadowRoot | Document;
      const focusedRow = (root.activeElement as HTMLElement | null)?.closest?.(".check");
      const focusedAt = focusedRow && list.contains(focusedRow) ? [...list.children].indexOf(focusedRow) : -1;
      const focusedId = focusedRow?.getAttribute("data-id");

      list.replaceChildren(...results.map((r) => {
        const icon = svg(r.severity === "warning" ? ICONS.warning : ICONS.info);
        const fix = r.fix && !readOnly
          ? h("button", { type: "button", class: "btn", text: "Fix", "aria-label": `Fix: ${r.message}`, onclick: () => onFix(r.fix!) })
          : null;
        return h("li", { class: `check ${r.severity}`, "data-id": r.id },
          h("span", { class: "ic", role: "img", "aria-label": r.severity === "warning" ? "Warning" : "Info" }, icon),
          h("p", { text: r.message }),
          fix,
        );
      }));

      if (focusedAt >= 0) {
        const rows = [...list.children] as HTMLElement[];
        const fixOf = (row?: HTMLElement) => row?.querySelector<HTMLButtonElement>("button") ?? null;
        const same = rows.find((row) => row.dataset.id === focusedId);
        const target = fixOf(same)
          ?? rows.slice(focusedAt).map(fixOf).find(Boolean)
          ?? rows.slice(0, focusedAt).reverse().map(fixOf).find(Boolean)
          ?? (el.closest('[role="tabpanel"]') as HTMLElement | null) ?? el;
        target.focus();
      }
    },
  };
}
