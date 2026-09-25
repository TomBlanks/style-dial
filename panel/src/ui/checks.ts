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
    },
  };
}
