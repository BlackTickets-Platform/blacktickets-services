# BlackTickets Services

BlackTickets is a microservices-based ticket booking platform with a React frontend, Node.js backend services, and an AI booking assistant powered by Amazon Bedrock.

## Services

- `frontend` - React/Vite user interface served by nginx.
- `identity-service` - authentication, users, JWT issuance, and seeded users.
- `event-service` - event catalog, event details, seat reservation, and poster uploads.
- `booking-service` - ticket booking workflow and booking notifications.
- `chatbot-service` - rule-based chat plus Agentic AI booking flow using Amazon Bedrock.

## Local Development

Use Docker Compose for local integration testing:

```bash
docker compose config
docker compose build
docker compose up
```

Provide local environment values through untracked `.env` files. Do not commit secrets, credentials, build artifacts, or dependencies.

## CI/CD

GitHub Actions builds each service independently using reusable workflow `ci-template.yml`.

Workflows:

- `ci-frontend.yml`
- `ci-identity-service.yml`
- `ci-event-service.yml`
- `ci-booking-service.yml`
- `ci-chatbot-service.yml`

Each workflow runs quality checks, dependency scanning, Docker image build, Trivy image scanning, and ECR push.

Required GitHub secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_ACCOUNT_ID`

Optional GitHub secrets:

- `SONAR_TOKEN`
- `SONAR_HOST_URL`
- `SNYK_TOKEN`

Image tags:

- `dev` branch pushes `dev-${GITHUB_SHA}`
- `main` branch pushes a semantic production version tag
- both branches also push a `${GITHUB_SHA}` tag

ECR repositories:

- `blacktickets-frontend`
- `blacktickets-identity-service`
- `blacktickets-event-service`
- `blacktickets-booking-service`
- `blacktickets-chatbot-service`

The deploy stage is currently a placeholder for a future update to the `blacktickets-helm` repository image tag. ArgoCD deployment is not triggered yet.
