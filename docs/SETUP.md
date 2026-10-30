# Setup

## 1. Create a SecureObs demo project

1. Sign in to SecureObs.
2. Create a project named `WebGoat Azure DevOps Demo`.
3. Generate an API token.
4. Copy the project ID and ingestion endpoint.

## 2. Configure Azure DevOps

Create a variable group named `secureobs-demo` containing:

| Variable | Type | Example |
|---|---|---|
| `SECUREOBS_INGEST_URL` | Secret | `https://app.secureobs.example/api/ingest` |
| `SECUREOBS_API_TOKEN` | Secret | A SecureObs API token |
| `SECUREOBS_PROJECT_ID` | Plain text | Your SecureObs project ID |

## 3. Import the pipeline

1. In Azure DevOps, create a new pipeline.
2. Select this repository.
3. Choose **Existing Azure Pipelines YAML file**.
4. Select `azure-pipelines.yml`.
5. Save and run the pipeline.

## 4. Record the dashboard

Add these GitHub Actions secrets:

| Secret | Purpose |
|---|---|
| `SECUREOBS_DEMO_URL` | Public or private URL of the SecureObs demo environment |
| `SECUREOBS_DEMO_EMAIL` | Demo user email |
| `SECUREOBS_DEMO_PASSWORD` | Demo user password |

Run **Record SecureObs demo** from the Actions tab.

Download the `secureobs-demo-video` artifact when the run completes.

## 5. Edit the final video

Recommended workflow:

1. Import the Playwright recording into Descript or CapCut.
2. Add a 5-second title card: **SecureObs — Security findings from Azure DevOps, made actionable**.
3. Add narration using `docs/DEMO_SCRIPT.md`.
4. Add captions.
5. End with: **Connect your pipeline in minutes. Try SecureObs.**
