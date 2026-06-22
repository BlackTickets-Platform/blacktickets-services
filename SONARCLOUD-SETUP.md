# SonarCloud Setup Guide

## Overview
This guide shows how to set up SonarCloud for BlackTickets and connect it to GitHub Actions.

## Step 1: Sign in to SonarCloud
1. Go to https://sonarcloud.io
2. Click **Log In**
3. Sign in with GitHub

## Step 2: Import Organization
1. Click your profile → **Organizations**
2. Choose **Import an organization from GitHub**
3. Select `BlackTickets-Platform`
4. Import the `blacktickets-services` repo

## Step 3: Generate SONAR_TOKEN
1. In SonarCloud, click your profile icon → **My Account**
2. Go to **Security**
3. Click **Generate Tokens**
4. Name it `blacktickets-ci`
5. Generate and copy the token

## Step 4: Add GitHub Secrets
1. Open GitHub repo settings: `Settings > Secrets and variables > Actions`
2. Add a new secret:
   - Name: `SONAR_TOKEN`
   - Value: the token from SonarCloud
3. Add another secret:
   - Name: `SONAR_HOST_URL`
   - Value: `https://sonarcloud.io`

## Step 5: Verify the SonarCloud scan
1. Push a change or rerun CI
2. Confirm the `Run SonarQube scan` step executes
3. Check SonarCloud dashboard for the new project result

## Notes
- If `SONAR_TOKEN` or `SONAR_HOST_URL` is missing, the CI step will skip SonarQube scan.
- Use the project key value from the workflow: `blacktickets-${{ inputs.service_name }}`
- For cloud, `SONAR_HOST_URL` is always `https://sonarcloud.io`
