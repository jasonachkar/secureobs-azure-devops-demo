#!/usr/bin/env python3
"""Create or reuse the SecureObs demo project and print its project ID."""

import argparse
import os
import requests


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--secureobs-url", required=True)
    parser.add_argument("--project-name", default="WebGoat Azure DevOps Demo")
    parser.add_argument("--api-token", required=True)
    args = parser.parse_args()

    response = requests.post(
        f"{args.secureobs_url.rstrip('/')}/api/projects",
        headers={
            "Authorization": f"Bearer {args.api_token}",
            "Content-Type": "application/json",
        },
        json={"name": args.project_name, "source": "azure-devops-demo"},
        timeout=30,
    )
    response.raise_for_status()
    project = response.json()
    project_id = project.get("id") or project.get("projectId")

    if not project_id:
        raise SystemExit("SecureObs did not return a project ID.")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as output:
            output.write(f"project_id={project_id}\n")

    print(f"SecureObs demo project ready: {project_id}")


if __name__ == "__main__":
    main()
