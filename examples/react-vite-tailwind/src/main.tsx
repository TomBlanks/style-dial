import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// style-dial:start
if (import.meta.env.DEV) {
  Promise.all([
    import("./dev/tweak-panel.js"),
    import("./dev/tweak.config.json"),
  ]).then(([, config]) => window.TweakPanel.mount(config.default));
}
// style-dial:end
