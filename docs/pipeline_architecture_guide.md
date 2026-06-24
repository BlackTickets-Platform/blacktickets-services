# BlackTickets DevOps CI/CD Pipeline Architecture

Here is the professional **DevOps CI/CD & GitOps Pipeline Architecture** diagram for the **BlackTickets** application. 

This diagram illustrates the automated flow from a developer commit to dynamic image scanning, ECR container storage, GitOps tag updates, and automatic EKS deployment.

## 🚀 Pipeline Flow Diagram

![BlackTickets CI/CD Pipeline](/C:/Users/anant/.gemini/antigravity-ide/brain/26fdec66-cd1f-41d4-bc49-b3350ca528ae/blacktickets_cicd_pipeline_1782223430505.png)

---

## 🔍 Detailed Stage Breakdown

### 1. Code Commit & Trigger
* A developer commits code changes to the `main` branch of `blacktickets-services`.
* GitHub Actions receives the webhook trigger and starts the build pipeline.

### 2. Stage 1: Continuous Integration (Lint, Test, Quality)
* **Code Integrity**: Executes `npm ci` followed by project linting configurations.
* **Testing**: Runs the unit test suite (`npm test --if-present`).
* **SonarCloud Integration**: Performs static code analysis (SAST) for bugs, code smells, and technical debt.

### 3. Stage 2: Continuous Security (Snyk, Trivy)
* **Snyk Dependency Scan**: Analyzes `package.json` and third-party dependencies for known vulnerabilities.
* **Trivy Container Scan**: Automatically runs immediately after the Docker build step to check the container OS packages (Alpine) for security warnings before pushing.

### 4. Stage 3: Build & Registry
* **Multi-Stage Build**: Compiles code and generates production-ready light images using Node/Alpine/Nginx layers.
* **Amazon ECR Push**: Authenticates via AWS OIDC/STS and pushes the image using a semantic version tag (e.g. `v0.1.0`).

### 5. Stage 4: GitOps & ArgoCD Sync
* **Helm Repository Update**: GitHub Actions automatically updates the values file (`values-dev.yaml` or `values-prod.yaml`) in the `blacktickets-helm` repository with the new image tag.
* **ArgoCD Reconciliation**: ArgoCD notices the tag change in Git, pulls the updated Helm values, and performs a rolling update rollout on **Amazon EKS** to replace old pods with no downtime.
