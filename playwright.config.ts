import { defineConfig, devices } from "@playwright/test";

const headed = process.env.SECUREOBS_MANUAL_LOGIN === "true";

export default defineConfig({
  testDir: "./playwright",
  timeout: 360000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com",
    trace: "retain-on-failure",
    video: {
      mode: "on",
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    headless: !headed,
    ...devices["Desktop Chrome"],
  },
  outputDir: "playwright/videos",
});
