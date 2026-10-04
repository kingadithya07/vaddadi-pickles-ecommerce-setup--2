import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { registerSW } from "virtual:pwa-register";

// Force check for service worker updates immediately on load
registerSW({
  immediate: true,
  onRegistered(r) {
    if (r) {
      // Check for updates periodically (every hour)
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    }
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
