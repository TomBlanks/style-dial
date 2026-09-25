"use client";
import { useEffect } from "react";
export default function DevTweakPanel() {
  useEffect(() => {
    // React runs effects twice in development (Strict Mode); skip a mount whose effect was already cleaned up.
    let cancelled = false;
    Promise.all([import("./tweak-panel.js"), import("./tweak.config.json")])
      .then(([, config]) => { if (!cancelled) window.TweakPanel.mount(config.default); });
    return () => { cancelled = true; window.TweakPanel?.unmount(); };
  }, []);
  return null;
}
