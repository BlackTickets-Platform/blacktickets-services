const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");

let cachedClient = null;
let credentialsExpiry = null;

const getBedrockClient = async () => {
  const roleArn = process.env.BEDROCK_ROLE_ARN;
  const region = process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1";

  if (!roleArn) {
    if (!cachedClient) {
      cachedClient = new BedrockRuntimeClient({ region });
    }
    return cachedClient;
  }

  if (cachedClient && credentialsExpiry && credentialsExpiry > Date.now() + 120000) {
    return cachedClient;
  }

  console.log(`Assuming Bedrock cross-account role: ${roleArn}`);
  const stsClient = new STSClient({ region });
  const assumeRoleCommand = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: "blacktickets-chatbot-bedrock-session",
    DurationSeconds: 900
  });

  const assumedRole = await stsClient.send(assumeRoleCommand);
  credentialsExpiry = new Date(assumedRole.Credentials.Expiration).getTime();

  cachedClient = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken
    }
  });

  return cachedClient;
};

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "amazon.nova-micro-v1:0";

const streamToString = async (stream) => {
  if (!stream) {
    return "";
  }

  if (typeof stream.transformToString === "function") {
    return stream.transformToString();
  }

  const chunks = [];
  for await (const chunk of stream) {
    if (typeof chunk === "string") {
      chunks.push(chunk);
    } else if (chunk instanceof Uint8Array) {
      chunks.push(Buffer.from(chunk).toString("utf8"));
    } else {
      chunks.push(chunk.toString());
    }
  }

  return chunks.join("");
};

const extractJson = (text) => {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Unable to extract valid JSON from Bedrock response.");
  }

  return text.slice(first, last + 1);
};

const normalizePromptValue = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const getEventId = (event) => event?.id ?? event?._id ?? event?.event_id;

const formatAvailableEvents = (events = []) => {
  if (!Array.isArray(events) || events.length === 0) {
    return "";
  }

  const eventLines = events.map((event, index) => {
    const id = normalizePromptValue(getEventId(event));
    const name = normalizePromptValue(event?.name);
    const description = normalizePromptValue(event?.description);
    const venue = normalizePromptValue(event?.venue);
    const availableSeats = normalizePromptValue(event?.available_seats ?? event?.availableSeats);

    return `${index + 1}. ID: ${id}, Name: ${name}, Description: ${description}, Venue: ${venue}, Available Seats: ${availableSeats}`;
  });

  return `Available events:
${eventLines.join("\n")}

Choose only from the available events above. If the user refers to an event by category, topic, venue, description, synonym, or informal wording, select the best matching available event. If multiple available events could match, do not guess; ask for clarification.`;
};

const analyzeIntent = async (message, availableEvents = []) => {
  if (!message || typeof message !== "string") {
    throw new Error("A non-empty message string is required.");
  }

  const modelId = MODEL_ID;
  const availableEventsPrompt = formatAvailableEvents(availableEvents);

  const prompt = `You are an AI booking assistant.

Return only valid JSON with this structure:
{
  "intent": "BOOK_TICKET | CHECK_EVENT | GENERAL_CHAT",
  "selectedEventId": null,
  "eventName": null,
  "ticketCount": 0,
  "confidence": "HIGH | MEDIUM | LOW",
  "needsClarification": false,
  "clarificationQuestion": null
}

Rules:
- Use intent "BOOK_TICKET" for requests to book, reserve, get passes, buy tickets, or hold seats.
- When available events are listed, selectedEventId must be one of those event IDs or null.
- When available events are listed, eventName must be the exact available event name you selected or null.
- Infer ticketCount from words and numbers, such as "two passes" meaning 2.
- If the user wants to book but the event is ambiguous, return needsClarification true, selectedEventId null, eventName null, confidence "LOW", and a short clarificationQuestion naming the likely events.
- If the ticket count is missing for a booking request, return ticketCount 0 and ask for clarification.

${availableEventsPrompt}

User message: "${message}"
`;

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    body: Buffer.from(
      JSON.stringify({
        schemaVersion: "messages-v1",
        messages: [
          {
            role: "user",
            content: [
              { text: prompt }
            ]
          }
        ],
        inferenceConfig: {
          maxTokens: 300,
          temperature: 0.1,
        },
      }),
      "utf8"
    ),
  });

  const bedrockClient = await getBedrockClient();
  const response = await bedrockClient.send(command);
  const rawOutput = await streamToString(response.Body ?? response.body);
  const parsedOutput = JSON.parse(rawOutput);
  const modelText = parsedOutput?.output?.message?.content?.[0]?.text;

  if (!modelText) {
    throw new Error("Unexpected Bedrock response format.");
  }

  const jsonText = extractJson(modelText);
  return JSON.parse(jsonText);
};

module.exports = {
  analyzeIntent,
  analyzeUserIntent: analyzeIntent,
};
