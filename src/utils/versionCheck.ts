/**
 * Automated version check and hard refresh utility for Vaddadi Pickles website and PWA.
 * Detects newly deployed builds on Render and automatically purges stale caches & hard-refreshes.
 */

let isChecking = false;

export async function checkForAppUpdates(): Promise<boolean> {
  if (isChecking) return false;
  isChecking = true;

  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) {
      isChecking = false;
      return false;
    }

    const data = await res.json();
    const remoteVersion = data?.version;
    if (!remoteVersion) {
      isChecking = false;
      return false;
    }

    const currentVersion = localStorage.getItem('app_build_version');

    // First time opening: record current build version
    if (!currentVersion) {
      localStorage.setItem('app_build_version', remoteVersion);
      isChecking = false;
      return false;
    }

    // New version detected!
    if (currentVersion !== remoteVersion) {
      console.log(`[App Update] New version detected: ${remoteVersion} (was ${currentVersion}). Refreshing app...`);
      localStorage.setItem('app_build_version', remoteVersion);

      // 1. Force active Service Worker to skip waiting and claim clients
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.update().catch(() => {});
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        } catch {}
      }

      // 2. Clear CacheStorage to eliminate stale cached bundles
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        } catch {}
      }

      // 3. Trigger hard refresh
      window.location.reload();
      return true;
    }
  } catch {
    // Offline or network error - fail silently
  } finally {
    isChecking = false;
  }

  return false;
}

export function initAutoUpdateWatcher() {
  // 1. Check immediately on page load
  checkForAppUpdates();

  // 2. Check whenever user returns to or focuses the website/PWA tab
  window.addEventListener('focus', () => {
    checkForAppUpdates();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForAppUpdates();
    }
  });

  // 3. Periodic check every 2 minutes
  setInterval(() => {
    checkForAppUpdates();
  }, 2 * 60 * 1000);
}

/**
 * Manual cache purge and reload helper.
 * Unregisters active service workers, clears CacheStorage, and reloads fresh.
 */
export async function clearAppCacheAndReload() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    localStorage.removeItem('app_build_version');
    sessionStorage.clear();
  } catch (e) {
    console.error('Error clearing cache:', e);
  } finally {
    window.location.reload();
  }
}
