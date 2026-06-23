const promClient = require("prom-client");

// Collect default system metrics (Memory, CPU, etc.)
promClient.collectDefaultMetrics({ register: promClient.register });

const httpRequestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"]
});

const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10]
});

const errorCounter = new promClient.Counter({
  name: "app_errors_total",
  help: "Total number of application errors",
  labelNames: ["service", "type"]
});

const metricsMiddleware = (req, res, next) => {
  if (req.path === "/metrics" || req.path === "/health") {
    return next();
  }

  const start = process.hrtime();
  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;

    httpRequestCounter.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: statusCode }, duration);

    if (statusCode >= 400) {
      const serviceName = process.env.SERVICE_NAME || "chatbot-service";
      errorCounter.inc({ service: serviceName, type: statusCode >= 500 ? "5xx" : "4xx" });
    }
  });

  next();
};

const metricsEndpoint = async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  errorCounter
};
