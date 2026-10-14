import { defineConfig } from "vite";
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  worker: { format: "es" },
  optimizeDeps: { include: ["@mediapipe/tasks-vision", "lil-gui", "stats.js"] },
});
