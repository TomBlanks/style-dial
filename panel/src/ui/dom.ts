// Tiny DOM builder, so the panel needs no framework.

type Child = Node | string | null | undefined | false;
type Props = Record<string, unknown>;

// Assigned as properties rather than attributes.
const PROPS = new Set(["value", "disabled", "hidden", "checked", "type", "id", "min", "max", "step", "open", "tabIndex"]);

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props | null = null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === "class") el.className = String(value);
      else if (key === "text") el.textContent = String(value);
      else if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      } else if (PROPS.has(key)) (el as unknown as Props)[key] = value;
      else el.setAttribute(key, value === true ? "" : String(value));
    }
  }
  append(el, children);
  return el;
}

export function append(parent: Node, children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    parent.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
}

/** Builds an element from a static, trusted SVG string (icons only). */
export function svg(markup: string): SVGElement {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  const el = t.content.firstElementChild as SVGElement;
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("focusable", "false");
  return el;
}

let uid = 0;
export const nextId = (prefix: string) => `dt-${prefix}-${++uid}`;
