import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components";
// @ts-ignore
import { registerSW } from "virtual:pwa-register";
import { initAutoUpdateWatcher } from "./utils/versionCheck";

// Start active version watcher to detect any new updates pushed to Render
initAutoUpdateWatcher();

// Force immediate Service Worker registration and check for updates
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // When a new service worker is installed, force it to activate immediately
    updateSW(true);
  },
  onRegistered(registration: any) {
    if (registration) {
      // Check for updates every 2 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 2 * 60 * 1000);

      // Check for updates whenever user returns to or focuses the window
      window.addEventListener("focus", () => {
        registration.update().catch(() => {});
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          registration.update().catch(() => {});
        }
      });
    }
  },
});

// Automatically reload the page and clear old caches when a new service worker takes control
let refreshing = false;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", async () => {
    if (!refreshing) {
      refreshing = true;
      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {}
      }
      window.location.reload();
    }
  });
}

// Automatically reload if a dynamic import fails due to a new deployment replacing chunk hashes
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
