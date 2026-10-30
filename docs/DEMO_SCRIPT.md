# End-to-end demo script

## Opening

> Connecting SecureObs takes minutes: fork a vulnerable app, connect the repository, add one workflow, and see prioritized security findings.

## Fork WebGoat

> We start with WebGoat, a deliberately vulnerable application, and fork it into our own GitHub account.

## Create SecureObs project

> In SecureObs, we create a project for this repository.

## Connect repository

> We connect the forked WebGoat repository. SecureObs generates the GitHub Actions workflow needed to scan it.

## Add workflow

> We paste the generated YAML into the repository’s GitHub Actions workflow and commit it.

## Run pipeline

> The workflow runs dependency scanning, secret detection, and static analysis, then sends normalized findings to SecureObs.

## Results

> Once the workflow succeeds, SecureObs shows the results in one dashboard: severity, scanner source, affected location, remediation guidance, and trends.

## Finding details

> We open individual findings to see exactly what was detected, where it exists, and what the team should do next.

## Close

> SecureObs turns fragmented security scanner output into actionable engineering work.
>
> Connect your repository in minutes. Try SecureObs.
