// Writes overridden tokens into one unlayered <style> element (spec §6.3).

import type { Token, TweakConfig } from "./config/types";
import { formatNumber } from "./format";
import { changedKeys, type Value, type Values } from "./state/values";

export const STYLE_ID = "style-dial-overrides";

export function cssValue(token: Token, value: Value): string {
  if (token.type === "color") return String(value);
  const n = formatNumber(Number(value));
  return token.type === "size" ? n + token.unit : n;
}

/** The `:root { … }` rule for values that differ from the defaults, or "" when nothing differs. */
export function buildOverrideCss(config: TweakConfig, values: Values, defaults: Values): string {
  const lines: string[] = [];
  for (const key of changedKeys(config, values, defaults)) {
    const token = config.tokens.find((t) => t.var === key)!;
    lines.push(`  ${key}: ${cssValue(token, values[key])};`);
  }
  return lines.length ? `:root {\n${lines.join("\n")}\n}` : "";
}

/** Owns the <style> element and batches writes to one per animation frame. */
export class OverrideWriter {
  private el: HTMLStyleElement | null = null;
  private pending: string | null = null;
  private frame = 0;

  constructor(private doc: Document = document) {}

  /** Queues CSS to be written on the next animation frame; later calls in the same frame win. */
  write(css: string): void {
    this.pending = css;
    if (!this.frame) {
      this.frame = requestAnimationFrame(() => this.flush());
    }
  }

  /** Writes any pending CSS immediately. */
  flush(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (this.pending === null) return;
    const el = this.element();
    if (el.textContent !== this.pending) el.textContent = this.pending;
    this.pending = null;
  }

  remove(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pending = null;
    this.el?.remove();
    this.el = null;
  }

  private element(): HTMLStyleElement {
    if (!this.el || !this.el.isConnected) {
      this.el = this.doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!this.el) {
        this.el = this.doc.createElement("style");
        this.el.id = STYLE_ID;
      }
    }
    // Keep it last in <head> so it also beats plain `:root` blocks that were added later.
    if (this.el.parentNode !== this.doc.head || this.doc.head.lastElementChild !== this.el) {
      this.doc.head.appendChild(this.el);
    }
    return this.el;
  }
}
