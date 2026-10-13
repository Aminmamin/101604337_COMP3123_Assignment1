const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const logger = require("../utils/logger");

async function auth(req, res, next) {
  const authorization = req.get("Authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);

  if (!match) {
    logger.warn("Authentication rejected: missing or malformed token");

    return res.status(401).json({
      success: false,
      message: "Provide a Bearer token"
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });
  } catch (error) {
    logger.warn("Authentication rejected: invalid or expired token");

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired. Log in again"
          : "Invalid token"
    });
  }

  if (
    typeof decoded !== "object" ||
    typeof decoded.sub !== "string" ||
    !mongoose.isObjectIdOrHexString(decoded.sub)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  try {
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = auth;