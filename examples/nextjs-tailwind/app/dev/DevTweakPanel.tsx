"use client";
import { useEffect } from "react";
// Imported statically so that when the config changes (e.g. Claude applied your tweaks), Fast Refresh
// re-runs this component and the panel remounts with the new defaults. This file is only loaded in development.
import config from "./tweak.config.json";

export default function DevTweakPanel() {
  useEffect(() => {
    // React runs effects twice in development (Strict Mode); skip a mount whose effect was already cleaned up.
    let cancelled = false;
    import("./tweak-panel.js").then(() => { if (!cancelled) window.TweakPanel.mount(config); });
    return () => { cancelled = true; window.TweakPanel?.unmount(); };
  }, [config]); // a new config (after an edit) remounts the panel with the new defaults
  return null;
}
