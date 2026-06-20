const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin role required" });
  }
  return next();
};

const requireServiceToken = (req, res, next) => {
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
  const providedToken = req.headers["x-service-token"];

  if (!expectedToken || providedToken !== expectedToken) {
    return res.status(403).json({ message: "Service token required" });
  }

  return next();
};

module.exports = { requireAuth, requireAdmin, requireServiceToken };
