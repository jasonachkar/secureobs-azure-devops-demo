import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 1200000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    ...devices["Desktop Chrome"],
  },
  outputDir: "playwright/videos",
});
