# SecureObs Azure DevOps Demo

This repository demonstrates how **SecureObs** ingests security findings from an Azure DevOps pipeline, normalizes them into a unified risk model, and presents them in a prioritized dashboard.

It uses [WebGoat](https://github.com/WebGoat/WebGoat), a deliberately vulnerable application, as a realistic scan target.

## What this demo shows

1. Azure DevOps builds and scans WebGoat.
2. Security scanners produce findings.
3. The pipeline sends normalized findings to SecureObs using an API token.
4. SecureObs displays severity, source scanner, affected location, remediation guidance, and trends.
5. Playwright records an automated walkthrough of the SecureObs dashboard.

## Repository layout

```text
.
├── azure-pipelines.yml          # Azure DevOps build + scan + SecureObs ingestion
├── scripts/
│   └── ingest-findings.py       # Converts scanner output and uploads it to SecureObs
├── playwright/
│   └── demo.spec.ts             # Automated SecureObs dashboard walkthrough
├── playwright.config.ts         # Playwright configuration with video recording
├── .github/workflows/
│   └── record-demo.yml          # Runs Playwright and uploads the recorded demo
└── docs/
    ├── SETUP.md
    ├── DEMO_SCRIPT.md
    └── architecture.md
```

## Quick start

### 1. Configure SecureObs

Create a SecureObs project for the demo and generate an API token.

Store the following values in Azure DevOps as secret variables or in a variable group named `secureobs-demo`:

```text
SECUREOBS_INGEST_URL=https://your-secureobs-instance/api/ingest
SECUREOBS_API_TOKEN=your-secureobs-api-token
SECUREOBS_PROJECT_ID=your-project-id
```

Never commit real tokens.

### 2. Run the Azure DevOps pipeline

Import `azure-pipelines.yml` into an Azure DevOps project, then run it against this repository.

The pipeline:

- Checks out the repository.
- Runs security scans against the WebGoat target.
- Normalizes findings.
- Uploads them to SecureObs.

### 3. Record the demo

The GitHub Actions workflow records a browser walkthrough of SecureObs using Playwright.

Set these repository secrets:

```text
SECUREOBS_DEMO_URL=https://your-secureobs-demo-url
SECUREOBS_DEMO_EMAIL=demo@example.com
SECUREOBS_DEMO_PASSWORD=your-demo-password
```

Then run the **Record SecureObs demo** workflow manually from the Actions tab.

The recording is uploaded as a workflow artifact named `secureobs-demo-video`.

## Security notes

- WebGoat is intentionally vulnerable and must only be run in an isolated demo environment.
- Do not expose SecureObs, WebGoat, or scanner services directly to the public internet.
- Store all tokens and credentials in Azure DevOps secret variables or GitHub Actions secrets.

## License

MIT for the demo automation and documentation in this repository. WebGoat remains subject to its upstream license.
