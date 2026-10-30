# SecureObs End-to-End Demo

This repository records a complete SecureObs onboarding demo using GitHub Actions:

```text
Sign in to SecureObs
  → Fork OWASP WebGoat
  → Create SecureObs project
  → Connect forked repository
  → Copy SecureObs GitHub Actions YAML
  → Commit workflow to WebGoat fork
  → Run workflow and wait for success
  → Return to SecureObs
  → Inspect normalized findings and details
```

## Record locally

```bash
npm install
npx playwright install chromium

GITHUB_USER=your-github-username \
SECUREOBS_DEMO_URL=https://secureobs.com \
npx playwright test playwright/end-to-end-demo.spec.ts --headed
```

The recording begins only after you complete Microsoft Entra sign-in.

The final video is saved in:

```text
playwright/videos/
```

## Required environment variables

| Variable | Purpose |
|---|---|
| `GITHUB_USER` | Your GitHub username, used for the WebGoat fork |
| `SECUREOBS_DEMO_URL` | SecureObs URL; defaults to `https://secureobs.com` |
| `SECUREOBS_PROJECT_NAME` | Optional demo project name |

## Important

- Do not record with your personal Entra account for public marketing material.
- Use a dedicated demo Entra tenant and demo user when possible.
- Replace the selector constants in `playwright/end-to-end-demo.spec.ts` with stable `data-testid` attributes from SecureObs.
- No API tokens or passwords are committed to this repository.
