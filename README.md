# SecureObs End-to-End Demo

Records a complete SecureObs onboarding demo using GitHub Actions:

```text
Sign in to GitHub
  → Fork/open WebGoat
  → Sign in to SecureObs
  → Create organization
  → Create project
  → Connect repository
  → Create API key
  → Store API key as GitHub secret SECUREOBS_API_TOKEN
  → Copy generated workflow YAML
  → Commit workflow
  → Run workflow and wait for success
  → Return to SecureObs and inspect findings
```

## Run

```bash
npm install
npx playwright install chromium

GITHUB_USER=secureobs-demo \
GITHUB_REPO=secureobs-demo/WebGoat \
GITHUB_DEMO_EMAIL='secureobsdemo@gmail.com' \
GITHUB_DEMO_PASSWORD='your-github-password' \
SECUREOBS_DEMO_URL=https://secureobs.com \
SECUREOBS_DEMO_EMAIL='secureobs-demo@your-tenant.onmicrosoft.com' \
SECUREOBS_DEMO_PASSWORD='your-entra-password' \
npx playwright test playwright/end-to-end-demo.spec.ts
```

The GitHub secret is named exactly:

```text
SECUREOBS_API_TOKEN
```

## MacBook Pro 14 rendering

The recorder uses a 1280×800 viewport at 2× density. This avoids the overly wide GitHub/SecureObs layout on a 14-inch MacBook while producing a readable demo recording.

## Security

- Use dedicated demo accounts.
- Do not commit credentials or API keys.
- Rotate the Entra password and SecureObs API key after recording.
- Replace selector constants with stable `data-testid` attributes as SecureObs evolves.
