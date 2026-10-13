const logger = require("../utils/logger");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let status = 500;
  let message = "Internal server error";

  if (error.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  } else if (error.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  } else if (error.code === 11000) {
    status = 409;
    message = "Username or email already exists";
  } else if (error.name === "ValidationError") {
    status = 400;
    message = "Invalid input";
  } else if (error.name === "CastError") {
    status = 400;
    message = "Invalid ID or field value";
  }

  // Do not log request bodies, passwords, tokens or database URLs.
  logger.log(status >= 500 ? "error" : "warn", {
    message: "Request failed",
    method: req.method,
    path: req.path,
    status,
    errorType: error.name || "Error"
  });

  return res.status(status).json({
    success: false,
    message
  });
}

module.exports = errorHandler;