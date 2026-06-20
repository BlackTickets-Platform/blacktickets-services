require("dotenv").config();
const app = require("./src/app");
const { initDb } = require("./src/config/db");

const PORT = process.env.PORT || 4003;

const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`booking-service running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("booking-service startup failed:", error);
  process.exit(1);
});
