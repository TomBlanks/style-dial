// Controls tab: grouped size / number / colour controls (spec §6.5).

import { GROUPS, type ColorToken, type RangeToken, type Token } from "../config/types";
import { clamp, formatNumber, normaliseHex } from "../format";
import { sameValue, type Value, type Values } from "../state/values";
import { h, nextId, svg } from "./dom";
import { ICONS } from "./icons";

export interface ControlActions {
  /** Live change while the user is interacting (slider drag, colour picker open). */
  set(name: string, value: Value): void;
  /** Called when an interaction finishes (pointer release, blur/Enter, picker closed). History hooks in here in M2. */
  commit(): void;
}

interface Control {
  el: HTMLElement;
  update(values: Values, defaults: Values, disabled: boolean): void;
}

export function buildControls(tokens: Token[], actions: ControlActions) {
  const controls: Control[] = [];
  const root = h("div");
  for (const group of GROUPS) {
    const inGroup = tokens.filter((t) => t.group === group);
    if (!inGroup.length) continue;
    const rows = h("div", { class: "rows" });
    for (const token of inGroup) {
      const c = token.type === "color" ? colourControl(token, actions) : rangeControl(token, actions);
      controls.push(c);
      rows.appendChild(c.el);
    }
    root.appendChild(h("details", { class: "group", open: true }, h("summary", null, svg(ICONS.chevron), group), rows));
  }
  return {
    el: root,
    update(values: Values, defaults: Values, disabled: boolean) {
      for (const c of controls) c.update(values, defaults, disabled);
    },
  };
}

function resetButton(label: string, token: Token, onClick: () => void): HTMLButtonElement {
  const def = token.type === "color" ? token.default : formatNumber(token.default) + (token.type === "size" ? token.unit : "");
  return h(
    "button",
    { class: "reset", type: "button", "aria-label": `Reset ${label} to ${def}`, "data-tip": `Reset to ${def}`, "data-tip-pos": "left", onclick: onClick },
    svg(ICONS.reset),
  );
}

function rangeControl(token: RangeToken, actions: ControlActions): Control {
  const id = nextId("range");
  const unit = token.type === "size" ? token.unit : "";
  const px = token.type === "size" && token.unit === "rem" ? h("span", { class: "sub", "aria-hidden": "true" }) : null;

  const slider = h("input", {
    type: "range", id, min: String(token.min), max: String(token.max), step: String(token.step),
    oninput: () => actions.set(token.var, parseFloat(slider.value)),
    onchange: () => actions.commit(),
  });
  const number = h("input", {
    type: "text", inputmode: "decimal", "aria-label": `${token.label} value${unit ? ` in ${unit}` : ""}`,
    onkeydown: (e: KeyboardEvent) => {
      if (e.key === "Enter") number.blur();
      if (e.key === "Escape") { number.value = shown; number.blur(); }
    },
    onblur: () => {
      const n = parseFloat(number.value);
      if (Number.isNaN(n)) { number.value = shown; return; }
      actions.set(token.var, clamp(Math.round(n * 1e4) / 1e4, token.min, token.max));
      actions.commit();
      number.value = shown; // reflects the clamped value
    },
  });
  const reset = resetButton(token.label, token, () => { actions.set(token.var, token.default); actions.commit(); });
  const row = h(
    "div", { class: "ctl" },
    h("div", { class: "ctl-head" },
      h("label", { for: id, text: token.label }),
      px,
      reset,
      h("div", { class: "num" }, number, unit ? h("span", { text: unit, "aria-hidden": "true" }) : null),
    ),
    slider,
  );

  let shown = "";
  return {
    el: row,
    update(values, defaults, disabled) {
      const v = Number(values[token.var]);
      shown = formatNumber(v);
      if (slider.value !== String(v)) slider.value = String(v);
      slider.style.setProperty("--p", ((v - token.min) / (token.max - token.min)) * 100 + "%");
      if (!isFocused(number)) number.value = shown;
      if (px) px.textContent = formatNumber(v * 16) + "px";
      setChanged(row, reset, !sameValue(values[token.var], defaults[token.var]) && !disabled);
      slider.disabled = number.disabled = disabled;
    },
  };
}

function colourControl(token: ColorToken, actions: ControlActions): Control {
  const id = nextId("hex");
  const picker = h("input", {
    type: "color", class: "swatch", "aria-label": `Pick ${token.label} colour`,
    oninput: () => actions.set(token.var, picker.value.toLowerCase()),
    onchange: () => actions.commit(),
  });
  const hex = h("input", {
    type: "text", id, class: "hex", spellcheck: "false", autocomplete: "off", maxlength: "7",
    onkeydown: (e: KeyboardEvent) => {
      if (e.key === "Enter") hex.blur();
      if (e.key === "Escape") { hex.value = shown; hex.blur(); }
    },
    onblur: () => {
      const raw = hex.value.trim();
      const v = normaliseHex(raw.startsWith("#") ? raw : "#" + raw);
      if (v && v !== shown) { actions.set(token.var, v); actions.commit(); }
      hex.value = v ?? shown; // invalid text reverts to the last valid value
    },
  });
  const reset = resetButton(token.label, token, () => { actions.set(token.var, token.default); actions.commit(); });
  const row = h("div", { class: "colour" }, h("label", { for: id, text: token.label }), reset, picker, hex);

  let shown = "";
  return {
    el: row,
    update(values, defaults, disabled) {
      shown = String(values[token.var]);
      if (picker.value !== shown) picker.value = shown;
      if (!isFocused(hex)) hex.value = shown;
      setChanged(row, reset, !sameValue(values[token.var], defaults[token.var]) && !disabled);
      picker.disabled = hex.disabled = disabled;
    },
  };
}

/** Don't overwrite text the user is typing. */
function isFocused(el: HTMLElement): boolean {
  return (el.getRootNode() as ShadowRoot | Document).activeElement === el;
}

function setChanged(row: HTMLElement, reset: HTMLButtonElement, changed: boolean) {
  row.classList.toggle("changed", changed);
  reset.setAttribute("aria-hidden", String(!changed));
  reset.tabIndex = changed ? 0 : -1;
}
