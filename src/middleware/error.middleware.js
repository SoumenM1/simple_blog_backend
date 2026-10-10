const HttpError = require("../utils/httpError");
function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details;
  if (err.name === "ValidationError") {
    status = 400;
    message = "Database validation failed";
    details = Object.values(err.errors).map((e) => e.message);
  }
  if (err.code === 11000) {
    status = 409;
    message = "A record with this value already exists";
    details = Object.keys(err.keyValue || {});
  }
  if (process.env.NODE_ENV !== "production" && status === 500)
    console.error(err);
  res
    .status(status)
    .json({
      success: false,
      error: {
        message,
        ...(details ? { details } : {}),
        ...(process.env.NODE_ENV !== "production" && status === 500
          ? { stack: err.stack }
          : {}),
      },
    });
}
module.exports = { notFound, errorHandler };
