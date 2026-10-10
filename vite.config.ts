import { defineConfig } from "vite";
export default defineConfig({
  optimizeDeps: { include: ["@mediapipe/tasks-vision", "lil-gui", "stats.js"] },
});
