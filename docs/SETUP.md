# Setup

## Security requirement

Never commit `SECUREOBS_API_TOKEN` to this repository.

Store it as:

- An Azure DevOps secret variable or variable-group secret.
- A GitHub Actions repository secret.

If a token has been shared in chat, email, a screenshot, or a public file, revoke it immediately and create a replacement.

## 1. Automatic project creation

The demo can create or reuse a SecureObs project named:

```text
WebGoat Azure DevOps Demo
```

Set these Azure DevOps variables:

| Variable | Type | Example |
|---|---|---|
| `SECUREOBS_BASE_URL` | Secret | `https://secureobs.com` |
| `SECUREOBS_INGEST_URL` | Secret | `https://secureobs.com/api/ingest` |
| `SECUREOBS_API_TOKEN` | Secret | A SecureObs API token |
| `SECUREOBS_PROJECT_ID` | Plain text | Created automatically or supplied manually |

## 2. Import the Azure DevOps pipeline

1. Create a pipeline from this repository.
2. Select `azure-pipelines.yml`.
3. Run it.

The pipeline creates or reuses the demo project, runs scanners, normalizes findings, and uploads them to SecureObs.

## 3. Record with Microsoft Entra ID

Because SecureObs uses Microsoft Entra ID, do not automate login with a personal account.

Recommended approach:

1. Create a dedicated demo Entra tenant and demo user.
2. Run Playwright locally in headed mode:

```bash
SECUREOBS_MANUAL_LOGIN=true \
SECUREOBS_DEMO_URL=https://secureobs.com \
npx playwright test --headed
```

3. Complete Entra sign-in manually.
4. Playwright waits for the dashboard, then records the walkthrough.

For fully unattended CI recording, use a dedicated demo tenant and test account—not a personal Microsoft account.

## 4. GitHub Actions recording

Set these repository secrets:

| Secret | Purpose |
|---|---|
| `SECUREOBS_DEMO_URL` | SecureObs demo URL |
| `SECUREOBS_DEMO_EMAIL` | Dedicated demo user email |
| `SECUREOBS_DEMO_PASSWORD` | Dedicated demo user password |

For Entra ID, run the recording locally with `SECUREOBS_MANUAL_LOGIN=true` instead of storing a personal password in CI.

## 5. Final video

1. Download the `secureobs-demo-video` artifact.
2. Import it into Descript or CapCut.
3. Add narration from `docs/DEMO_SCRIPT.md`.
4. Add captions and a closing CTA.
