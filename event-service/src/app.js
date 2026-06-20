const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ service: "event-service", status: "ok" });
});

app.use("/events", eventRoutes);
app.use(errorHandler);

module.exports = app;
