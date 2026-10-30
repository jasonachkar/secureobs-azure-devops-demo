import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 120000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.SECUREOBS_DEMO_URL ?? "http://localhost:4200",
    trace: "retain-on-failure",
    video: {
      mode: "on",
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    ...devices["Desktop Chrome"],
  },
  outputDir: "playwright/videos",
});
