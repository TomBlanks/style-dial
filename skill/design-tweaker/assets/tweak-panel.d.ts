// Types for the Design Tweaker panel global (development only).
export {};

declare global {
  interface Window {
    TweakPanel: {
      /** Mounts the panel with a tweak.config.json object. Calling it twice is a no-op. */
      mount(config: unknown): void;
      /** Removes the panel and its override styles. */
      unmount(): void;
    };
  }
}
