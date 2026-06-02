import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-extension-manifest",
      closeBundle() {
        mkdirSync("dist/assets", { recursive: true });
        copyFileSync("manifest.json", "dist/manifest.json");
        cpSync("assets", "dist/assets", { recursive: true });
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: "popup.html",
        options: "options.html",
        background: "src/background/index.ts",
        content: "src/content/index.ts"
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
