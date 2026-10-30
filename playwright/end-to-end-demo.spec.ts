import { test, expect, chromium, type BrowserContext } from "@playwright/test";
import path from "node:path";

const secureObsUrl = process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com";
const githubUrl = process.env.GITHUB_URL ?? "https://github.com";
const webgoatRepo = process.env.WEBGOAT_REPO ?? "OWASP/WebGoat";
const githubUser = process.env.GITHUB_USER;
const demoProjectName = process.env.SECUREOBS_PROJECT_NAME ?? "WebGoat GitHub Actions Demo";

if (!githubUser) {
  throw new Error("Set GITHUB_USER to your GitHub username.");
}

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

test("Record full SecureObs onboarding and GitHub Actions demo", async ({}, testInfo) => {
  const profileDir = path.join(process.cwd(), ".playwright-chrome-profile");

  const context: BrowserContext = await chromium.launchPersistentContext(profileDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    args: ["--start-maximized"],
    recordVideo: {
      dir: testInfo.outputDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await page.goto(`${githubUrl}/${webgoatRepo}`);

    const forkButton = page.getByRole("button", { name: /fork/i }).first();
    if (await forkButton.isVisible().catch(() => false)) {
      await forkButton.click();
      const createFork = page.getByRole("button", { name: /create fork/i }).first();
      if (await createFork.isVisible().catch(() => false)) {
        await createFork.click();
      }
    }

    await page.goto(`${githubUrl}/${githubUser}/WebGoat`);
    await expect(page).toHaveURL(new RegExp(`${githubUser}/WebGoat`), { timeout: 60000 });

    await page.goto(secureObsUrl);
    await page.getByRole("button", { name: selectors.createProjectButton }).first().click();
    await page.getByLabel(selectors.projectNameInput).fill(demoProjectName);
    await page.getByRole("button", { name: /create/i }).click();

    await page.getByRole("button", { name: selectors.connectRepository }).first().click();
    await page.getByLabel(selectors.repositoryInput).fill(`${githubUrl}/${githubUser}/WebGoat`);
    await page.getByRole("button", { name: /connect|save/i }).click();

    await page.getByRole("button", { name: selectors.generateWorkflow }).first().click();
    const workflowYaml = await page
      .getByRole("button", { name: selectors.copyYaml })
      .first()
      .getAttribute("data-clipboard-text");

    if (!workflowYaml) {
      throw new Error(
        "SecureObs must expose the generated YAML through data-clipboard-text or another accessible attribute."
      );
    }

    await page.goto(
      `${githubUrl}/${githubUser}/WebGoat/new/main?filename=.github/workflows/secureobs.yml`
    );
    await page.getByLabel(/file contents|editor/i).fill(workflowYaml);
    await page.getByRole("button", { name: /commit changes/i }).click();

    await page.goto(`${githubUrl}/${githubUser}/WebGoat/actions`);
    await page.getByText(/secureobs/i).first().click();
    await page.getByRole("button", { name: /run workflow/i }).first().click();
    await page.getByRole("button", { name: /run workflow/i }).last().click();

    await expect(
      page
        .locator(
          "[data-testid='workflow-run-status'], .Label--success, [title='Success']"
        )
        .first()
    ).toBeVisible({ timeout: 900000 });

    await page.goto(secureObsUrl);
    await page.getByText(demoProjectName).first().click();
    await page.getByRole("tab", { name: selectors.findingsTab }).click();

    await page.getByText(selectors.findingRow).first().click();
    await page.getByRole("button", { name: selectors.findingDetails }).first().click();
    await page.waitForTimeout(4000);

    await page.getByText(selectors.findingRow).nth(1).click();
    await page.getByRole("button", { name: selectors.findingDetails }).first().click();
    await page.waitForTimeout(4000);
  } finally {
    await context.close();
  }
});
