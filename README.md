# SecureObs Azure DevOps Demo

This repository demonstrates how **SecureObs** turns Azure DevOps security-scanner output into one normalized, prioritized risk dashboard.

It uses [WebGoat](https://github.com/WebGoat/WebGoat), a deliberately vulnerable application, as the demo target.

## Demo flow

```text
Connect Azure DevOps
  → SecureObs creates or reuses the demo project
  → Pipeline runs Trivy, Gitleaks, and Semgrep
  → Findings are normalized and ingested
  → SecureObs dashboard shows prioritized risks
  → Playwright records the walkthrough
```

## Quick start

### 1. Configure secrets

Store these values in Azure DevOps and GitHub Actions secrets:

```text
SECUREOBS_BASE_URL=https://secureobs.com
SECUREOBS_INGEST_URL=https://secureobs.com/api/ingest
SECUREOBS_API_TOKEN=<store-as-secret>
SECUREOBS_PROJECT_ID=<created automatically or supplied manually>
```

Never commit an API token to this repository.

### 2. Run the Azure DevOps pipeline

Import `azure-pipelines.yml`, then run the pipeline. It creates or reuses the `WebGoat Azure DevOps Demo` project, scans the repository, and uploads findings to SecureObs.

### 3. Record the dashboard

For Microsoft Entra ID sign-in, run locally:

```bash
SECUREOBS_MANUAL_LOGIN=true \
SECUREOBS_DEMO_URL=https://secureobs.com \
npx playwright test --headed
```

Complete the Entra login manually. Playwright then records the SecureObs dashboard walkthrough.

## Security notes

- WebGoat is intentionally vulnerable; run it only in an isolated environment.
- Use a dedicated demo Entra tenant and demo user for automation.
- Revoke and rotate any API token that has been exposed outside a secrets manager.

## License

MIT for the demo automation and documentation. WebGoat remains subject to its upstream license.
