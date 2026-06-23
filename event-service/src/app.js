const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const { metricsMiddleware, metricsEndpoint } = require("./middleware/metrics");

const app = express();
app.use(metricsMiddleware);
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ service: "event-service", status: "ok" });
});

app.get("/metrics", metricsEndpoint);

app.use("/events", eventRoutes);
app.use(errorHandler);

module.exports = app;
