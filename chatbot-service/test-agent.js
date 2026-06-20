require("dotenv").config();

const { handleAgentRequest } = require("./src/services/agentService");

const run = async () => {
  try {
    const token = process.env.TEST_JWT_TOKEN;
    const result = await handleAgentRequest("Book 2 tickets for Tech Conference 2026", token);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error running agent test:", error);
    process.exit(1);
  }
};

run();
