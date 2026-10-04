const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const config = require("./env");
const logger = require("../utils/logger");

let memoryServer = null;

const connectDB = async () => {
  try {
    let uri = config.MONGODB_URI;

    if (!uri) {
      logger.info("MONGODB_URI not provided in environment. Initializing MongoMemoryServer for development...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      logger.info("Local In-Memory MongoDB initialized successfully.");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Gracefully closing MongoDB connection...`);
      await mongoose.connection.close();
      if (memoryServer) {
        await memoryServer.stop();
      }
      process.exit(0);
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));

    return conn;
  } catch (error) {
    logger.error("Failed to connect to MongoDB", { error: error.message });

    // If external Atlas connection failed in dev, attempt in-memory fallback
    if (config.NODE_ENV !== "production" && !memoryServer) {
      try {
        logger.info("Attempting local In-Memory MongoDB fallback...");
        const { MongoMemoryServer } = require("mongodb-memory-server");
        memoryServer = await MongoMemoryServer.create();
        const fallbackUri = memoryServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        logger.info(`MongoDB Connected via In-Memory fallback: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        logger.error("In-Memory fallback failed as well", { error: fallbackError.message });
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;
