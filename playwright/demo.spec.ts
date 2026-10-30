import { test, expect } from "@playwright/test";

const baseUrl = process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com";

const manualEntraLogin = process.env.SECUREOBS_MANUAL_LOGIN === "true";
const demoEmail = process.env.SECUREOBS_DEMO_EMAIL;
const demoPassword = process.env.SECUREOBS_DEMO_PASSWORD;

test("Record SecureObs dashboard walkthrough", async ({ page }) => {
  await page.goto(baseUrl);

  if (manualEntraLogin) {
    // Pause for an interactive Microsoft Entra ID sign-in.
    // The user completes authentication in the headed browser session.
    await page.waitForURL(/dashboard|projects|overview/i, { timeout: 300000 });
  } else if (demoEmail && demoPassword) {
    await page.getByLabel(/email/i).fill(demoEmail);
    await page.getByLabel(/password/i).fill(demoPassword);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/dashboard|projects|overview/i, { timeout: 30000 });
  } else {
    throw new Error(
      "Set SECUREOBS_MANUAL_LOGIN=true for Entra ID, or provide demo credentials."
    );
  }

  await page.getByText(/webgoat|demo project/i).first().click();
  await page.getByRole("tab", { name: /findings|risks|security/i }).click();
  await page.getByRole("button", { name: /critical|high/i }).first().click();
  await page.getByText(/trivy|gitleaks|semgrep/i).first().click();
  await page.getByRole("button", { name: /export|report|work item/i }).first().click();

  await page.waitForTimeout(3000);
});
