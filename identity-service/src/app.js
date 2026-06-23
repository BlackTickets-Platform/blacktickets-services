const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const { metricsMiddleware, metricsEndpoint } = require("./middleware/metrics");

const app = express();
app.use(metricsMiddleware);

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ service: "identity-service", status: "ok" });
});

app.get("/metrics", metricsEndpoint);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use(errorHandler);

module.exports = app;
