import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Injectado automaticamente em TODOS os ficheiros .scss
        additionalData: `
          @use "@/assets/styles/_variables.scss" as *;
          @use "@/assets/styles/_mixins.scss" as *;
        `,
      },
    },
  },
});
