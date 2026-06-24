# BlackTickets Terraform Infrastructure as Code Architecture

Here is the professional **Terraform IaC Architecture** diagram for the **BlackTickets** platform. 

This diagram illustrates how your modular Terraform codebase is structured, how it manages state files securely with locks, and the cloud resources it provisions automatically.

## 🛠️ Terraform Infrastructure Diagram

![BlackTickets Terraform Architecture](/C:/Users/anant/.gemini/antigravity-ide/brain/26fdec66-cd1f-41d4-bc49-b3350ca528ae/blacktickets_terraform_architecture_1782223524468.png)

---

## 🔍 Module Breakdown & Provisioned Resources

### 1. Remote State Backend (Security & Lock Management)
* **S3 Backend**: Stores the secure, encrypted state file (`terraform.tfstate`) containing the status of all managed cloud resources.
* **DynamoDB Table**: Handles state locking (`LockID`) to prevent concurrent Terraform executions from corrupting the state file.

### 2. Networking & Compute Modules
* **`networking` module**: Provisions the VPC, Public Subnets, Private App Subnets, Private DB Subnets, Route Tables, Internet Gateway, and NAT Gateway.
* **`eks` module**: Provisions EKS control plane cluster, node groups, launch templates, autoscaling groups, and configurations.
* **`ecr` module**: Configures private image repositories for frontend and backend services.

### 3. Data & Messaging Modules
* **`rds` module**: Provisions a secure Multi-AZ subnet database group and the RDS PostgreSQL instance.
* **`s3` module**: Configures the event-poster storage bucket with lifecycle configurations, server-side encryption (SSE-S3), and public access blocks.
* **`sqs` & `sns` modules**: Configures SQS messaging queues and SNS email/SMS topics.
* **`lambda` module**: Packages, zips, uploads, and deploys the notification processor code.

### 4. Integration, Security & Monitoring Modules
* **`irsa` module**: Configures OIDC federated trust policies and maps AWS IAM Roles to Kubernetes Service Accounts.
* **`argocd` module**: Deploys ArgoCD via Helm and creates the bootstrap root K8s application pointing to Git.
* **`observability` & `monitoring` modules**: Configures CloudWatch log groups, Prometheus Rules, Grafana setups, and RDS CPU alerts.
