import { test, expect } from "@playwright/test";

const baseUrl = process.env.SECUREOBS_DEMO_URL ?? "http://localhost:4200";
const email = process.env.SECUREOBS_DEMO_EMAIL ?? "demo@example.com";
const password = process.env.SECUREOBS_DEMO_PASSWORD ?? "demo-password";

test("Record SecureObs dashboard walkthrough", async ({ page }) => {
  await page.goto(baseUrl);

  // Adjust selectors to match the current SecureObs Angular dashboard.
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  await expect(page).toHaveURL(/dashboard|projects|overview/i, { timeout: 30000 });

  await page.getByText(/webgoat|demo project/i).first().click();

  await page.getByRole("tab", { name: /findings|risks|security/i }).click();

  await page.getByRole("button", { name: /critical|high/i }).first().click();

  await page.getByText(/trivy|gitleaks|semgrep/i).first().click();

  await page.getByRole("button", { name: /export|report|work item/i }).first().click();

  await page.waitForTimeout(3000);
});
