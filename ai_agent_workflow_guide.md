# BlackTickets AI Agent Workflow Architecture

Here is the professional **AI Agent Workflow Architecture** diagram for the **BlackTickets** intelligent booking assistant. 

This diagram illustrates how natural language user requests are parsed by Amazon Bedrock, processed through a reasoning loop inside the `chatbot-service`, and translated into concrete actions across your microservices.

## 🤖 AI Agent Workflow Diagram

![BlackTickets AI Agent Workflow](/C:/Users/anant/.gemini/antigravity-ide/brain/26fdec66-cd1f-41d4-bc49-b3350ca528ae/blacktickets_ai_agent_workflow_1782223699853.png)

---

## 🔍 Step-by-Step Agentic Reasoning Loop

### 1. User Prompt (Natural Language Input)
* **Action**: A user enters a natural language query in the chat interface: *“Book 2 tickets for the Tech Conference.”*
* **Routing**: The React frontend sends this string via POST request to the `/api/chatbot` route, which proxies it to the `chatbot-service` pod inside EKS.

### 2. Intent Parsing (Amazon Bedrock)
* **Cross-Account Call**: The `chatbot-service` assumes the cross-account IAM role and submits the user prompt to **Amazon Bedrock**.
* **Model**: It uses the lightweight and fast **Amazon Nova Micro** model (`amazon.nova-micro-v1:0`).
* **Processing**: Bedrock parses the text, extracts parameters (quantity: `2`, event: `Tech Conference`), and classifies the intent (e.g. `BOOK_TICKET`).

### 3. Reasoning & Orchestration Loop
* Upon receiving the parsed intent (`BOOK_TICKET`) from Bedrock, the `chatbot-service` begins execution:
  * **Step A (Lookup)**: Calls `event-service` to locate the event UUID and check ticket availability.
  * **Step B (Reservation)**: Calls `booking-service` to initiate the booking database transaction.

### 4. Serverless Notification Output
* Once `booking-service` writes the transaction:
  * Publishes a message to the **Amazon SQS** queue.
  * **AWS Lambda** pulls the queue, generates an email confirmation, and triggers **Amazon SNS**.
  * User receives the email confirmation.
