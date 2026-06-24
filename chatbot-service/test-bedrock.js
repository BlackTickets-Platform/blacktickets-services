const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

const test = async () => {
  try {
    const client = new BedrockRuntimeClient({
      region: "us-east-1"
    });

    const command = new ConverseCommand({
      modelId: "ai21.jamba-1-5-mini-v1:0",
      messages: [
        {
          role: "user",
          content: [{ text: "Hello! Answer in exactly three words." }]
        }
      ],
      inferenceConfig: {
        maxTokens: 50,
        temperature: 0.1
      }
    });

    console.log("Sending request to Jamba 1.5 Mini...");
    const response = await client.send(command);
    console.log("Response output:", JSON.stringify(response.output, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
};

test();
