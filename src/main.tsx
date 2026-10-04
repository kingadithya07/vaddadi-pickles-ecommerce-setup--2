import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
// @ts-ignore
import { registerSW } from "virtual:pwa-register";

// Force check for service worker updates immediately on load
registerSW({
  immediate: true,
  onRegistered(r: any) {
    if (r) {
      // Check for updates periodically (every hour)
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    }
  },
});

// Automatically reload the page when a new service worker takes control
let refreshing = false;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
