import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 1200000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com",
    trace: "retain-on-failure",
    viewport: { width: 1920, height: 1080 },
    ...devices["Desktop Chrome"],
  },
  outputDir: "playwright/videos",
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        headless: false,
      },
    },
  ],
});
