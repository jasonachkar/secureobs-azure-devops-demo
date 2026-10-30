import { test, expect, chromium, type BrowserContext, type Page } from "@playwright/test";
import path from "node:path";

const secureObsUrl = process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com";
const githubUrl = process.env.GITHUB_URL ?? "https://github.com";
const webgoatRepo = process.env.WEBGOAT_REPO ?? "OWASP/WebGoat";
const githubUser = process.env.GITHUB_USER;
const demoProjectName = process.env.SECUREOBS_PROJECT_NAME ?? "WebGoat GitHub Actions Demo";
const entraEmail = process.env.SECUREOBS_DEMO_EMAIL;
const entraPassword = process.env.SECUREOBS_DEMO_PASSWORD;
const githubEmail = process.env.GITHUB_DEMO_EMAIL;
const githubPassword = process.env.GITHUB_DEMO_PASSWORD;

if (!githubUser) {
  throw new Error("Set GITHUB_USER to your GitHub username.");
}

if (!entraEmail || !entraPassword) {
  throw new Error(
    "Set SECUREOBS_DEMO_EMAIL and SECUREOBS_DEMO_PASSWORD for automated Entra sign-in."
  );
}

if (!githubEmail || !githubPassword) {
  throw new Error(
    "Set GITHUB_DEMO_EMAIL and GITHUB_DEMO_PASSWORD for automated GitHub sign-in."
  );
}

const selectors = {
  // Parentheses are required: [dashboard|projects|overview] is a character class
  // and incorrectly matches almost any URL, including Microsoft login URLs.
  secureObsApp: /(dashboard|projects|overview)/i,
  createProjectButton: /(create project|new project|add project)/i,
  projectNameInput: 'input[placeholder*="project" i], input[name*="project" i], input[data-testid*="project-name" i]',
  connectRepository: /(connect repository|add repository|connect repo)/i,
  repositoryInput: 'input[placeholder*="repository" i], input[name*="repository" i], input[data-testid*="repository" i]',
  generateWorkflow: /(generate workflow|pipeline yaml|github actions)/i,
  copyYaml: /(copy yaml|copy workflow|copy)/i,
  findingsTab: /(findings|risks|security)/i,
  findingRow: /(trivy|gitleaks|semgrep|critical|high)/i,
  findingDetails: /(details|view|open)/i,
};

async function isGitHubAuthenticated(page: Page) {
  await page.goto(`${githubUrl}/${githubUser}`);
  return !page.url().includes("/login");
}

async function signInToGitHub(page: Page) {
  if (await isGitHubAuthenticated(page)) {
    return;
  }

  await page.goto(`${githubUrl}/login`);

  const emailInput = page.locator('#login_field').first();
  await emailInput.waitFor({ state: "visible", timeout: 30000 });
  await emailInput.fill(githubEmail!);

  const passwordInput = page.locator('#password').first();
  await passwordInput.waitFor({ state: "visible", timeout: 30000 });
  await passwordInput.fill(githubPassword!);

  await page.getByRole("button", { name: /^sign in$/i }).click();

  console.log("\nApprove GitHub 2FA/passkey in the opened Chrome window if prompted...");

  await page.waitForURL(
    (url) => !url.href.includes("/login") && !url.href.includes("/sessions/verified-device"),
    { timeout: 300000 }
  );

  await expect(page).toHaveURL(new RegExp(`${githubUser}`), { timeout: 60000 });
}

async function signInWithEntra(page: Page) {
  await page.goto(secureObsUrl);

  // Wait for either the Entra email field or an authenticated SecureObs route.
  const entraEmailField = page.locator('input[name="loginfmt"], input[type="email"]').first();
  const secureObsLoaded = page.waitForURL(selectors.secureObsApp, { timeout: 120000 });

  await Promise.race([
    entraEmailField.waitFor({ state: "visible", timeout: 120000 }),
    secureObsLoaded,
  ]);

  // Already authenticated.
  if (!(await entraEmailField.isVisible().catch(() => false))) {
    return;
  }

  // Enter Entra email.
  await entraEmailField.fill(entraEmail!);

  const nextButton = page.getByRole("button", { name: /^next$/i }).first();
  if (await nextButton.isVisible().catch(() => false)) {
    await nextButton.click();
  } else {
    await entraEmailField.press("Enter");
  }

  // Enter Entra password.
  const passwordField = page.locator('input[name="passwd"], input[type="password"]').first();
  await passwordField.waitFor({ state: "visible", timeout: 60000 });
  await passwordField.fill(entraPassword!);

  const signInButton = page.getByRole("button", { name: /^sign in$/i }).first();
  if (await signInButton.isVisible().catch(() => false)) {
    await signInButton.click();
  } else {
    await passwordField.press("Enter");
  }

  // Handle "Stay signed in?" if Microsoft displays it.
  const staySignedIn = page.getByRole("button", { name: /^yes$/i }).first();
  if (await staySignedIn.isVisible().catch(() => false)) {
    await staySignedIn.click();
  }

  console.log("\nApprove MFA/2FA in the opened Chrome window if prompted...");

  // Wait for MFA approval and return to SecureObs.
  await page.waitForURL(
    (url) => !url.href.includes("login.microsoftonline.com"),
    { timeout: 300000 }
  );

  await page.waitForURL(selectors.secureObsApp, { timeout: 120000 });
}

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
    // Sign into GitHub before forking WebGoat.
    await signInToGitHub(page);

    // Fork WebGoat, or open the existing fork.
    await page.goto(`${githubUrl}/${webgoatRepo}`);

    const forkButton = page.getByRole("button", { name: /^fork$/i }).first();
    if (await forkButton.isVisible().catch(() => false)) {
      await forkButton.click();
      const createFork = page.getByRole("button", { name: /create fork/i }).first();
      if (await createFork.isVisible().catch(() => false)) {
        await createFork.click();
      }
    }

    await page.goto(`${githubUrl}/${githubUser}/WebGoat`);
    await expect(page).toHaveURL(new RegExp(`${githubUser}/WebGoat`), { timeout: 60000 });

    // Authenticate SecureObs using Entra credentials and optional manual MFA.
    await signInWithEntra(page);

    // Create the SecureObs project.
    await page.getByRole("button", { name: selectors.createProjectButton }).first().click();

    const projectName = page.locator(selectors.projectNameInput).first();
    await projectName.waitFor({ state: "visible", timeout: 60000 });
    await projectName.fill(demoProjectName);

    await page.getByRole("button", { name: /^create$/i }).click();

    // Connect the forked repository.
    await page.getByRole("button", { name: selectors.connectRepository }).first().click();

    const repositoryInput = page.locator(selectors.repositoryInput).first();
    await repositoryInput.waitFor({ state: "visible", timeout: 60000 });
    await repositoryInput.fill(`${githubUrl}/${githubUser}/WebGoat`);

    await page.getByRole("button", { name: /^connect$|^save$/i }).click();

    // Copy SecureObs-generated GitHub Actions YAML.
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

    // Add workflow to the fork.
    await page.goto(
      `${githubUrl}/${githubUser}/WebGoat/new/main?filename=.github/workflows/secureobs.yml`
    );
    await page.getByLabel(/file contents|editor/i).fill(workflowYaml);
    await page.getByRole("button", { name: /commit changes/i }).click();

    // Run workflow and wait for success.
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

    // Show SecureObs results.
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
