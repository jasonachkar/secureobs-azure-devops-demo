#!/usr/bin/env python3
"""Normalize scanner output and upload findings to SecureObs."""

import argparse
import json
import os
from pathlib import Path

import requests


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def normalize_trivy(data):
    findings = []
    for result in data.get("Results", []) if data else []:
        for vuln in result.get("Vulnerabilities", []) or []:
            findings.append(
                {
                    "title": vuln.get("VulnerabilityID", "Dependency vulnerability"),
                    "description": vuln.get("Title", ""),
                    "severity": vuln.get("Severity", "UNKNOWN").upper(),
                    "scanner": "trivy",
                    "category": "dependency",
                    "location": result.get("Target", ""),
                    "remediation": vuln.get("FixedVersion", "Upgrade affected dependency"),
                    "metadata": {
                        "package": vuln.get("PkgName"),
                        "installed_version": vuln.get("InstalledVersion"),
                        "fixed_version": vuln.get("FixedVersion"),
                    },
                }
            )
    return findings


def normalize_gitleaks(data):
    findings = []
    for item in data or []:
        findings.append(
            {
                "title": item.get("RuleID", "Potential secret detected"),
                "description": item.get("Description", "Potential hardcoded secret"),
                "severity": "CRITICAL",
                "scanner": "gitleaks",
                "category": "secrets",
                "location": f"{item.get('File', '')}:{item.get('StartLine', '')}",
                "remediation": "Rotate the exposed credential and remove it from source control.",
                "metadata": {
                    "rule": item.get("RuleID"),
                    "commit": item.get("Commit"),
                },
            }
        )
    return findings


def normalize_semgrep(data):
    findings = []
    for result in data.get("results", []) if data else []:
        extra = result.get("extra", {})
        findings.append(
            {
                "title": result.get("check_id", "Static analysis finding"),
                "description": extra.get("message", ""),
                "severity": extra.get("severity", "WARNING").upper(),
                "scanner": "semgrep",
                "category": "sast",
                "location": f"{result.get('path', '')}:{result.get('start', {}).get('line', '')}",
                "remediation": extra.get("fix", "Review and remediate the flagged code path."),
                "metadata": {
                    "rule_id": result.get("check_id"),
                    "lines": result.get("extra", {}).get("lines"),
                },
            }
        )
    return findings


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--secureobs-url", required=True)
    parser.add_argument("--project-id", required=True)
    parser.add_argument("--api-token", required=True)
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    findings = []
    findings.extend(normalize_trivy(load_json(input_dir / "trivy.json")))
    findings.extend(normalize_gitleaks(load_json(input_dir / "gitleaks.json")))
    findings.extend(normalize_semgrep(load_json(input_dir / "semgrep.json")))

    payload = {
        "projectId": args.project_id,
        "source": "azure-devops",
        "pipelineRunId": os.environ.get("BUILD_BUILDID", "local"),
        "repository": os.environ.get("BUILD_REPOSITORY_NAME", "secureobs-demo"),
        "branch": os.environ.get("BUILD_SOURCEBRANCHNAME", "main"),
        "findings": findings,
    }

    response = requests.post(
        args.secureobs_url,
        headers={
            "Authorization": f"Bearer {args.api_token}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    print(f"Uploaded {len(findings)} normalized findings to SecureObs.")


if __name__ == "__main__":
    main()
