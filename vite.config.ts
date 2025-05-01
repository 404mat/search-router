import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import transformPlugin from "vite-plugin-transform";
import { resolve, join } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ["**/*.{js,css,html}", "assets/inter*.woff2"],
        },
      }),
    ],
  };
});
