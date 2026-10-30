import { test, expect, type BrowserContext } from "@playwright/test";

const secureObsUrl = process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com";
const githubUrl = process.env.GITHUB_URL ?? "https://github.com";
const webgoatRepo = process.env.WEBGOAT_REPO ?? "OWASP/WebGoat";
const demoProjectName = process.env.SECUREOBS_PROJECT_NAME ?? "WebGoat GitHub Actions Demo";

/**
 * End-to-end recorded narrative:
 * 1. Sign in to SecureObs without recording.
 * 2. Start recording after authentication.
 * 3. Fork WebGoat.
 * 4. Create/connect a SecureObs project.
 * 5. Add the generated GitHub Actions workflow.
 * 6. Wait for the workflow to succeed.
 * 7. Return to SecureObs and inspect findings.
 *
 * Replace the SELECTORS below with stable data-testid attributes in SecureObs.
 */
const selectors = {
  secureObsDashboard: /[dashboard|projects|overview]/i,
  createProjectButton: /[create project|new project|add project]/i,
  projectNameInput: /[project name|name]/i,
  connectRepository: /[connect repository|add repository|connect repo]/i,
  repositoryInput: /[repository|repo url|github url]/i,
  generateWorkflow: /[generate workflow|pipeline yaml|github actions]/i,
  copyYaml: /[copy yaml|copy workflow|copy]/i,
  findingsTab: /[findings|risks|security]/i,
  findingRow: /[trivy|gitleaks|semgrep|critical|high]/i,
  findingDetails: /[details|view|open]/i,
};

test("Record full SecureObs onboarding and GitHub Actions demo", async ({ browser }) => {
  // Phase 1: unrecorded Entra ID authentication.
  const loginContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: "playwright/videos/discarded", size: { width: 1920, height: 1080 } },
  });
  const loginPage = await loginContext.newPage();

  await loginPage.goto(secureObsUrl);
  await loginPage.waitForURL(selectors.secureObsDashboard, { timeout: 300000 });

  // Close the pre-login context so its video is not used.
  await loginContext.close();

  // Phase 2: recorded demo begins only after successful login.
  const demoContext: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: "playwright/videos",
      size: { width: 1920, height: 1080 },
    },
  });
  const page = await demoContext.newPage();

  // Fork WebGoat.
  await page.goto(`${githubUrl}/${webgoatRepo}`);
  await page.getByRole("button", { name: /fork/i }).click();
  await page.getByRole("button", { name: /create fork/i }).click();
  await page.waitForURL(/\/[^"]+\/WebGoat/i, { timeout: 60000 });

  // Create or open the SecureObs project.
  await page.goto(secureObsUrl);
  await page.getByRole("button", { name: selectors.createProjectButton }).click();
  await page.getByLabel(selectors.projectNameInput).fill(demoProjectName);
  await page.getByRole("button", { name: /create/i }).click();

  // Connect the forked repository.
  await page.getByRole("button", { name: selectors.connectRepository }).click();
  await page.getByLabel(selectors.repositoryInput).fill(`${githubUrl}/${process.env.GITHUB_USER}/WebGoat`);
  await page.getByRole("button", { name: /connect|save/i }).click();

  // Copy the SecureObs-generated GitHub Actions workflow.
  await page.getByRole("button", { name: selectors.generateWorkflow }).click();
  const workflowYaml = await page.getByRole("button", { name: selectors.copyYaml }).getAttribute("data-clipboard-text");

  if (!workflowYaml) {
    throw new Error("SecureObs did not expose the generated workflow YAML.");
  }

  // Add the workflow to the forked WebGoat repository.
  await page.goto(`${githubUrl}/${process.env.GITHUB_USER}/WebGoat/new/main?filename=.github/workflows/secureobs.yml`);
  await page.getByLabel(/file contents|editor/i).fill(workflowYaml);
  await page.getByRole("button", { name: /commit changes/i }).click();

  // Run and wait for the GitHub Actions workflow.
  await page.goto(`${githubUrl}/${process.env.GITHUB_USER}/WebGoat/actions`);
  await page.getByText(/secureobs/i).first().click();
  await page.getByRole("button", { name: /run workflow/i }).click();
  await page.getByRole("button", { name: /run workflow/i }).click();

  await expect(
    page.locator("[data-testid='workflow-run-status'], .Label--success, [title='Success']").first()
  ).toBeVisible({ timeout: 900000 });

  // Return to SecureObs and inspect the normalized findings.
  await page.goto(secureObsUrl);
  await page.getByText(demoProjectName).first().click();
  await page.getByRole("tab", { name: selectors.findingsTab }).click();

  await page.getByText(selectors.findingRow).first().click();
  await page.getByRole("button", { name: selectors.findingDetails }).first().click();
  await page.waitForTimeout(4000);

  await page.getByText(selectors.findingRow).nth(1).click();
  await page.getByRole("button", { name: selectors.findingDetails }).first().click();
  await page.waitForTimeout(4000);

  await demoContext.close();
});
