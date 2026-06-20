const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ service: "booking-service", status: "ok" });
});

app.use("/bookings", bookingRoutes);
app.use(errorHandler);

module.exports = app;
