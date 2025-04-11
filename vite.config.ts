import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url"; // necessário pra funcionar com import.meta
import { themePlugin } from "./client/src/theme";

// Corrigir import.meta.dirname para ambientes CJS:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "react/jsx-runtime",
        "@capacitor/app",
        "@capacitor/browser",
        "@capacitor/local-notifications",
        "@capacitor/haptics",
        "lucide-react",
        "react-hook-form",
        "@hookform/resolvers/zod",
        "@radix-ui/react-toast",
        "class-variance-authority",
        "@radix-ui/react-select",
        "@radix-ui/react-label",
        "@radix-ui/react-separator",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-slider",
        "tailwind-merge",
      ],
    },
  },
});
