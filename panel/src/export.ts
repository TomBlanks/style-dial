// "Copy changes" text (spec §6.11) and the clipboard fallbacks.

import type { TweakConfig } from "./config/types";
import { cssValue } from "./overrides";
import { changedKeys, type Values } from "./state/values";

/** The design-tweaks block for one version: only tokens that differ from the defaults, in config order. */
export function buildExport(config: TweakConfig, version: string, values: Values, defaults: Values): string {
  const lines = ["```design-tweaks", "Apply these design tweaks (design-tweaker v1)", `version: ${version}`, `tokens-file: ${config.tokensFile}`];
  for (const key of changedKeys(config, values, defaults)) {
    const token = config.tokens.find((t) => t.var === key)!;
    lines.push(`${key}: ${cssValue(token, values[key])};`);
  }
  lines.push("```");
  return lines.join("\n");
}

export type CopyResult = "clipboard" | "fallback" | "failed";

/**
 * Tries the Clipboard API, then a hidden textarea + execCommand("copy").
 * `scratch` is where the temporary textarea goes (inside the panel's shadow root, so the site is untouched).
 */
export async function copyText(text: string, scratch: Node): Promise<CopyResult> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return "clipboard";
    }
  } catch {
    // fall through to the textarea method
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
  scratch.appendChild(ta);
  try {
    ta.select();
    return document.execCommand("copy") ? "fallback" : "failed";
  } catch {
    return "failed";
  } finally {
    ta.remove();
  }
}
