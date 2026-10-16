import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  testMatch: "**/*.spec.ts",
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
  webServer: [
    {
      command: "pnpm dev --port 5173 --strictPort",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm api:migrate && pnpm api:dev",
      url: "http://127.0.0.1:8787/health",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
