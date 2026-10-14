require("dotenv").config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

if (
  !process.env.JWT_SECRET ||
  Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32
) {
  throw new Error("JWT_SECRET must contain at least 32 bytes");
}

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Server startup failed. Check database configuration");
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;