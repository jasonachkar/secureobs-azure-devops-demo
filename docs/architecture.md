# Architecture

```text
Azure DevOps Pipeline
        │
        ├── Trivy        → dependency findings
        ├── Gitleaks     → secret findings
        └── Semgrep      → static-analysis findings
        │
        ▼
Normalization script
        │
        ▼
SecureObs ingestion API
        │
        ▼
Unified risk model
        │
        ▼
SecureObs Angular dashboard
        │
        ▼
Playwright recording
```

## Design principles

- SecureObs does not replace scanners; it aggregates and normalizes their output.
- Scanner-specific formats are converted into a common finding schema.
- API tokens are stored only as CI/CD secrets.
- The vulnerable WebGoat application is used only in an isolated demo environment.
- Playwright produces a repeatable, reproducible product demo recording.
