const logger = require("../config/logger");
const { error } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // SQL Server unique constraint violation
  if (err.number === 2627 || err.number === 2601) {
    return error(res, "Duplicate entry — record already exists", 409);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return error(res, "Invalid token", 401);
  }
  if (err.name === "TokenExpiredError") {
    return error(res, "Token expired, please log in again", 401);
  }

  // Validation errors (from validator middleware)
  if (err.isValidation) {
    return error(res, "Validation failed", 400, err.errors);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  return error(res, message, statusCode);
};

// Custom error class for throwing intentional errors with status codes
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

module.exports = { errorHandler, AppError };
