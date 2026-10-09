import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  use: {
    permissions: ["camera", "microphone"],
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: {
    command: "pnpm dev --port 5173 --strictPort",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
});
