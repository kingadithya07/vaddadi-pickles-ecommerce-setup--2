import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to automatically generate version.json on every build
function generateVersionPlugin() {
  return {
    name: "generate-version-file",
    buildStart() {
      const buildVersion = Date.now().toString();
      const versionData = {
        version: buildVersion,
        buildDate: new Date().toISOString(),
      };
      const publicDir = path.resolve(__dirname, "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(
        path.resolve(publicDir, "version.json"),
        JSON.stringify(versionData, null, 2)
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    generateVersionPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globIgnores: ["**/version.json"],
        navigateFallbackDenylist: [/^\/version\.json/],
      },
      includeAssets: ["logo192.png", "logo512.png"],
      manifest: {
        name: "Vaddadi Pickles",
        short_name: "Vaddadi Pickles",
        description: "Authentic Homemade Pickles",
        theme_color: "#16a34a",
        icons: [
          {
            src: "logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
});
