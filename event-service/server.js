require("dotenv").config();
const app = require("./src/app");
const { initDb } = require("./src/config/db");

const PORT = process.env.PORT || 4002;

const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`event-service running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("event-service startup failed:", error);
  process.exit(1);
});
