const express = require("express");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use((req, res, next) => {
  res.on("finish", () => {
    logger.info({
      message: "API request",
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });

  next();
});

function rateLimitHandler(req, res) {
  logger.warn("Request rejected: rate limit exceeded");

  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later"
  });
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

app.use("/api", apiLimiter);
app.use("/api/v1/user", authLimiter);

app.use(express.json({ limit: "20kb" }));

// Connect before processing database requests.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/emp", employeeRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(errorHandler);

module.exports = app;