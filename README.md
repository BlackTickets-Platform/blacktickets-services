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

Future CI/CD pipelines will build service images and push them to Amazon ECR for deployment to EKS through Helm and ArgoCD.
