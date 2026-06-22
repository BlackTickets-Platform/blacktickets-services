# GitHub Secrets Configuration

This document lists all required and optional GitHub secrets for the CI/CD pipeline.

## Required Secrets

### AWS ECR Push Credentials
- **Name:** `AWS_ECR_PUSH_ROLE_ARN`
- **Purpose:** IAM role ARN for pushing Docker images to ECR
- **Example:** `arn:aws:iam::091869721157:role/github-terraform`

- **Name:** `AWS_REGION`
- **Purpose:** AWS region where ECR repositories are located
- **Example:** `us-east-1`

- **Name:** `AWS_ACCOUNT_ID`
- **Purpose:** AWS account ID (12-digit number)
- **Example:** `091869721157`

### Helm Repository Access
- **Name:** `HELM_REPO_PAT`
- **Purpose:** Personal Access Token for pushing changes to `blacktickets-helm`
- **Permissions needed:** `repo` (full control of private repositories)

## Optional Secrets

### SonarCloud Code Quality
- **Name:** `SONAR_TOKEN`
- **Purpose:** SonarCloud authentication token for code quality scans
- **Value:** generated from SonarCloud

- **Name:** `SONAR_HOST_URL`
- **Purpose:** SonarCloud endpoint
- **Value:** `https://sonarcloud.io`

### Snyk Dependency Security
- **Name:** `SNYK_TOKEN`
- **Purpose:** Snyk authentication token for dependency vulnerability scanning

## Setup Checklist

- [ ] `AWS_ECR_PUSH_ROLE_ARN`
- [ ] `AWS_REGION`
- [ ] `AWS_ACCOUNT_ID`
- [ ] `HELM_REPO_PAT`
- [ ] `SONAR_TOKEN` (optional)
- [ ] `SONAR_HOST_URL` (optional)
- [ ] `SNYK_TOKEN` (optional)
