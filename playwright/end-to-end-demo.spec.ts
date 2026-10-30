import { test, expect, chromium, type BrowserContext, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

const secureObsUrl = process.env.SECUREOBS_DEMO_URL ?? "https://secureobs.com";
const githubUrl = process.env.GITHUB_URL ?? "https://github.com";
const webgoatRepo = process.env.WEBGOAT_REPO ?? "OWASP/WebGoat";
const githubUser = process.env.GITHUB_USER;
const githubRepo = process.env.GITHUB_REPO ?? `${githubUser}/WebGoat`;
const demoProjectName = process.env.SECUREOBS_PROJECT_NAME ?? "WebGoat GitHub Actions Demo";
const organizationName = process.env.SECUREOBS_ORG_NAME ?? "SecureObs Demo";
const entraEmail = process.env.SECUREOBS_DEMO_EMAIL;
const entraPassword = process.env.SECUREOBS_DEMO_PASSWORD;
const githubEmail = process.env.GITHUB_DEMO_EMAIL;
const githubPassword = process.env.GITHUB_DEMO_PASSWORD;

if (!githubUser) throw new Error("Set GITHUB_USER.");
if (!entraEmail || !entraPassword) throw new Error("Set SECUREOBS_DEMO_EMAIL and SECUREOBS_DEMO_PASSWORD.");
if (!githubEmail || !githubPassword) throw new Error("Set GITHUB_DEMO_EMAIL and GITHUB_DEMO_PASSWORD.");

const selectors = {
  secureObsApp: /(dashboard|projects|overview|organizations)/i,
  createOrganization: /(create organization|new organization|add organization)/i,
  organizationNameInput: 'input[placeholder*="organization" i], input[name*="organization" i], input[data-testid*="organization-name" i]',
  createProject: /(create project|new project|add project)/i,
  projectNameInput: 'input[placeholder*="project" i], input[name*="project" i], input[data-testid*="project-name" i]',
  connectRepository: /(connect repository|add repository|connect repo)/i,
  repositoryInput: 'input[placeholder*="repository" i], input[name*="repository" i], input[data-testid*="repository" i]',
  createApiKey: /(create api key|new api key|generate api key|api keys)/i,
  apiKeyNameInput: 'input[placeholder*="api key" i], input[name*="api key" i], input[data-testid*="api-key-name" i]',
  apiKeyValue: '[data-testid="api-key-value"], code, pre, input[readonly]',
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
  if (await isGitHubAuthenticated(page)) return;

  await page.goto(`${githubUrl}/login`);
  const email = page.locator('#login_field').first();
  await email.waitFor();
  await email.fill(githubEmail!);
  const password = page.locator('#password').first();
  await password.waitFor();
  await password.fill(githubPassword!);
  await page.getByRole("button", { name: /^sign in$/i }).click();

  console.log("\nApprove GitHub 2FA/passkey if prompted...");
  await page.waitForURL(
    (url) => !url.href.includes("/login") && !url.href.includes("/sessions/verified-device"),
    { timeout: 300000 }
  );
}

async function signInWithEntra(page: Page) {
  await page.goto(secureObsUrl);

  const emailField = page.locator('input[name="loginfmt"], input[type="email"]').first();
  const appLoaded = page.waitForURL(selectors.secureObsApp, { timeout: 120000 });

  await Promise.race([
    emailField.waitFor({ state: "visible", timeout: 120000 }),
    appLoaded,
  ]);

  if (!(await emailField.isVisible().catch(() => false))) return;

  await emailField.fill(entraEmail!);
  const next = page.getByRole("button", { name: /^next$/i }).first();
  if (await next.isVisible().catch(() => false)) await next.click();
  else await emailField.press("Enter");

  const password = page.locator('input[name="passwd"], input[type="password"]').first();
  await password.waitFor({ state: "visible", timeout: 60000 });
  await password.fill(entraPassword!);
  const signIn = page.getByRole("button", { name: /^sign in$/i }).first();
  if (await signIn.isVisible().catch(() => false)) await signIn.click();
  else await password.press("Enter");

  const yes = page.getByRole("button", { name: /^yes$/i }).first();
  if (await yes.isVisible().catch(() => false)) await yes.click();

  console.log("\nApprove MFA/2FA if prompted...");
  await page.waitForURL(
    (url) => !url.href.includes("login.microsoftonline.com"),
    { timeout: 300000 }
  );
  await page.waitForURL(selectors.secureObsApp, { timeout: 120000 });
}

async function createOrganization(page: Page) {
  await page.goto(secureObsUrl);

  const createButton = page.getByRole("button", { name: selectors.createOrganization }).first();
  if (await createButton.isVisible().catch(() => false)) {
    await createButton.click();
    const nameInput = page.locator(selectors.organizationNameInput).first();
    await nameInput.waitFor({ state: "visible", timeout: 30000 });
    await nameInput.fill(organizationName);
    await page.getByRole("button", { name: /^create$/i }).click();
  }

  await page.getByText(organizationName).first().waitFor({ timeout: 30000 });
}

async function createProject(page: Page) {
  await page.getByRole("button", { name: selectors.createProject }).first().click();
  const name = page.locator(selectors.projectNameInput).first();
  await name.waitFor({ state: "visible", timeout: 30000 });
  await name.fill(demoProjectName);
  await page.getByRole("button", { name: /^create$/i }).click();
  await page.getByText(demoProjectName).first().waitFor({ timeout: 30000 });
}

async function connectRepository(page: Page) {
  await page.getByRole("button", { name: selectors.connectRepository }).first().click();
  const repoInput = page.locator(selectors.repositoryInput).first();
  await repoInput.waitFor({ state: "visible", timeout: 30000 });
  await repoInput.fill(`${githubUrl}/${githubRepo}`);
  await page.getByRole("button", { name: /^connect$|^save$/i }).click();
}

async function createApiKey(page: Page): Promise<string> {
  await page.getByRole("button", { name: selectors.createApiKey }).first().click();

  const keyName = page.locator(selectors.apiKeyNameInput).first();
  if (await keyName.isVisible().catch(() => false)) {
    await keyName.fill("GitHub Actions Demo");
    await page.getByRole("button", { name: /create|generate/i }).click();
  }

  const keyValue = page.locator(selectors.apiKeyValue).first();
  await keyValue.waitFor({ state: "visible", timeout: 30000 });

  const apiKey =
    (await keyValue.getAttribute("value")) ??
    (await keyValue.getAttribute("data-clipboard-text")) ??
    (await keyValue.textContent());

  if (!apiKey) throw new Error("SecureObs did not expose the generated API key.");
  return apiKey.trim();
}

function storeGitHubSecret(apiKey: string) {
  execFileSync("gh", [
    "secret",
    "set",
    "SECUREOBS_API_TOKEN",
    "--repo",
    githubRepo,
    "--body",
    apiKey,
  ]);
}

async function addAndRunWorkflow(page: Page): Promise<string> {
  await page.getByRole("button", { name: selectors.generateWorkflow }).first().click();
  const workflowYaml = await page
    .getByRole("button", { name: selectors.copyYaml })
    .first()
    .getAttribute("data-clipboard-text");

  if (!workflowYaml) {
    throw new Error("SecureObs must expose its generated YAML through data-clipboard-text.");
  }

  await page.goto(
    `${githubUrl}/${githubRepo}/new/main?filename=.github/workflows/secureobs.yml`
  );
  await page.getByLabel(/file contents|editor/i).fill(workflowYaml);
  await page.getByRole("button", { name: /commit changes/i }).click();

  await page.goto(`${githubUrl}/${githubRepo}/actions`);
  await page.getByText(/secureobs/i).first().click();
  await page.getByRole("button", { name: /run workflow/i }).first().click();
  await page.getByRole("button", { name: /run workflow/i }).last().click();

  return workflowYaml;
}

test("Record full SecureObs onboarding, API key creation, and GitHub Actions demo", async ({}, testInfo) => {
  const profileDir = path.join(process.cwd(), ".playwright-chrome-profile");

  const context: BrowserContext = await chromium.launchPersistentContext(profileDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    args: ["--start-maximized"],
    recordVideo: {
      dir: testInfo.outputDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await signInToGitHub(page);

    // Fork WebGoat or open existing fork.
    await page.goto(`${githubUrl}/${webgoatRepo}`);
    const forkButton = page.getByRole("button", { name: /^fork$/i }).first();
    if (await forkButton.isVisible().catch(() => false)) {
      await forkButton.click();
      const createFork = page.getByRole("button", { name: /create fork/i }).first();
      if (await createFork.isVisible().catch(() => false)) {
        await createFork.click();
      }
    }

    await page.goto(`${githubUrl}/${githubRepo}`);
    await expect(page).toHaveURL(new RegExp(githubRepo.replace("/", "\\/")), { timeout: 60000 });

    await signInWithEntra(page);
    await createOrganization(page);
    await createProject(page);
    await connectRepository(page);

    const apiKey = await createApiKey(page);
    storeGitHubSecret(apiKey);

    await addAndRunWorkflow(page);

    // Wait for workflow success.
    await expect(
      page
        .locator("[data-testid='workflow-run-status'], .Label--success, [title='Success']")
        .first()
    ).toBeVisible({ timeout: 900000 });

    // Return to SecureObs and inspect findings.
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
