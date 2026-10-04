const config = require("../config/env");
const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Log error safely
  logger.error(err.message, { path: req.path, method: req.method });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    message = "Validation Error";
    errors = Object.values(err.errors).map((val) => val.message);
    statusCode = 400;
  }

  // Multer error
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Exceeds allowed limit.";
    } else {
      message = err.message;
    }
    statusCode = 400;
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token authorization signature";
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
