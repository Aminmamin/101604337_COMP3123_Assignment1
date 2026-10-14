const mongoose = require("mongoose");
const logger = require("../utils/logger");

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: "comp3123_assignment1",
        serverSelectionTimeoutMS: 10000
      })
      .then(() => {
        logger.info("MongoDB connected");
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
}

module.exports = connectDB;