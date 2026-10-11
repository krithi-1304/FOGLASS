import { defineConfig } from "vite";
export default defineConfig({
  worker: { format: "es" },
  optimizeDeps: { include: ["@mediapipe/tasks-vision", "lil-gui", "stats.js"] },
});
