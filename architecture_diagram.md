# BlackTickets Project Architecture

Here is the complete architecture diagram for your final capstone project. You can present this visual workflow to your mentors to demonstrate the system design.

```mermaid
graph TD
    %% External Traffic Flow
    User([User Browser]) -->|1. HTTPS Request| Route53[Amazon Route 53]
    Route53 --> WAF[AWS WAF]
    WAF --> ALB[AWS Application Load Balancer]

    %% AWS VPC Network Boundaries
    subgraph AWS_VPC [AWS VPC - 10.0.0.0/16]
        subgraph Public_Subnets [Public Subnets - Multi-AZ]
            ALB
        end

        subgraph Private_App_Subnets [Private App Subnets - Multi-AZ EKS]
            subgraph Namespace_Dev [K8s Namespace: blacktickets-dev]
                %% Gateway API Routing
                ALB -->|2. Route Traffic| Gateway[K8s Gateway / HTTPRoute]
                Gateway -->|3. Port 8080| FE[Frontend Pod: nginx-unprivileged]
                
                %% Pod Microservices
                FE -->|4. API Proxy| ID[identity-service - Replicas: 2]
                FE -->|4. API Proxy| EV[event-service - Replicas: 1]
                FE -->|4. API Proxy| BK[booking-service - Replicas: 2]
                FE -->|4. API Proxy| CB[chatbot-service - Replicas: 1]
                
                %% Pod Autoscaling
                HPA[Horizontal Pod Autoscaler] -.->|Autoscale| FE
                HPA -.->|Autoscale| Microservices[All Services]
            end

            subgraph Namespace_System [K8s Add-ons & System Namespace]
                Argo[ArgoCD Controller]
                ESO[External Secrets Operator]
                Prom[Prometheus & Grafana]
            end
        end

        subgraph Private_DB_Subnets [Private DB Subnets - Multi-AZ RDS]
            RDS[(RDS PostgreSQL)]
        end
    end

    %% Cloud Integration & Security
    subgraph AWS_Managed_Services [AWS Cloud Managed Services]
        ESO -->|IAM Role / IRSA| SecretsManager[AWS Secrets Manager]
        SecretsManager -.->|Decrypts Secrets| ESO
        EV -->|Write Posters| S3[(S3 Bucket: Posters)]
        BK -->|Publish Bookings| SQS[(SQS: Booking Notifications)]
        CB -->|AI Assistant| Bedrock[Amazon Bedrock]
        S3 --> CloudFront[Amazon CloudFront CDN]
    end

    %% Database Connection
    ID & EV & BK -->|TCP:5432| RDS

    %% User CDN assets
    CloudFront -->|Deliver Assets| User

    %% CI/CD Flow
    subgraph CI_CD_Pipeline [GitHub CI/CD GitOps Pipeline]
        Developer[Developer Push] -->|Git Commit| Repo_Services[blacktickets-services repo]
        Repo_Services -->|GitHub Actions| GHA[CI Workflow Runs]
        GHA -->|1. Build & Scan Trivy| ECR[AWS ECR Repository]
        GHA -->|2. Update Image Tag| Repo_Helm[blacktickets-helm repo]
        Repo_Helm -->|3. Auto-Sync GitOps| Argo
        Argo -->|4. Rollout Update| Namespace_Dev
    end

    %% Styling
    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:white;
    classDef k8s fill:#326CE5,stroke:#fff,stroke-width:2px,color:white;
    classDef pipeline fill:#24292e,stroke:#fff,stroke-width:1px,color:white;
    classDef external fill:#757575,stroke:#333,stroke-width:1px,color:white;

    class Route53,WAF,ALB,RDS,SecretsManager,S3,SQS,Bedrock,CloudFront,ECR aws;
    class Gateway,FE,ID,EV,BK,CB,Argo,ESO,Prom,HPA k8s;
    class Developer,Repo_Services,GHA,Repo_Helm pipeline;
    class User external;
```
