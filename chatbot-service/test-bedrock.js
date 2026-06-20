require("dotenv").config();

const { analyzeUserIntent } = require("./src/services/bedrockService");

const run = async () => {
  try {
    const result = await analyzeUserIntent("Book 2 tickets for Panchayathu");
    console.log(result);
  } catch (error) {
    console.error("Error running Bedrock test:", error);
    process.exit(1);
  }
};

run();
