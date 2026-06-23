const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const { metricsMiddleware, metricsEndpoint } = require("./middleware/metrics");

const app = express();
app.use(metricsMiddleware);

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ service: "chatbot-service", status: "ok" });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/ready", (req, res) => {
  res.status(200).json({ status: "ready" });
});

app.get("/metrics", metricsEndpoint);

app.use("/", chatRoutes);
app.use(errorHandler);

module.exports = app;
