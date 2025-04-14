import { defineConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // This makes '@' refer to the src directory
    },
  },
  server: {
    port: 5173, // or any port you prefer
  },
});
