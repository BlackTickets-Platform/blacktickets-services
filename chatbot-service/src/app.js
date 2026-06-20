const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ service: "chatbot-service", status: "ok" });
});

app.use("/", chatRoutes);
app.use(errorHandler);

module.exports = app;
