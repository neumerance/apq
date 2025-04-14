import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/_variables.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
