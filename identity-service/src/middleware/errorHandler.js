const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", {
    message: err.message,
    status: err.status,
    type: err.type,
  });
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
};

module.exports = { errorHandler };
