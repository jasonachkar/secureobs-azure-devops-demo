# SecureObs End-to-End Demo

Records a complete SecureObs onboarding demo using your installed Chrome and GitHub Actions.

```text
Open SecureObs using an already-authenticated Chrome profile
  → Fork or open WebGoat
  → Create SecureObs project
  → Connect forked repository
  → Copy SecureObs GitHub Actions YAML
  → Commit workflow
  → Run workflow and wait for success
  → Return to SecureObs
  → Inspect findings and details
```

## Run

```bash
npm install
npx playwright install chromium

GITHUB_USER=your-github-username \
SECUREOBS_DEMO_URL=https://secureobs.com \
npx playwright test playwright/end-to-end-demo.spec.ts
```

The first run opens a dedicated Chrome profile. Sign in once to GitHub and SecureObs; future runs reuse those sessions.

## Dedicated profile

The recorder uses:

```text
.playwright-chrome-profile
```

Do not point it at your daily Chrome profile. A dedicated profile keeps marketing-demo cookies separate from your personal browsing and reduces the risk of accidental exposure.

## Requirements

- `GITHUB_USER` must be set.
- SecureObs should expose its generated workflow YAML through `data-clipboard-text` or another automation-friendly attribute.
- Replace selector constants in `playwright/end-to-end-demo.spec.ts` with stable `data-testid` attributes.
- No API tokens or passwords are committed.
