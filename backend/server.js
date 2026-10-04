const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config/env");
const logger = require("./utils/logger");
const User = require("./models/User");

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Bootstrap initial Admin securely
    if (config.ADMIN_EMAIL && config.ADMIN_PASSWORD) {
      let admin = await User.findOne({ email: config.ADMIN_EMAIL });
      if (!admin) {
        logger.info(`Creating initial administrator account: ${config.ADMIN_EMAIL}`);
        admin = new User({
          name: config.ADMIN_NAME || "Vespera Administrator",
          email: config.ADMIN_EMAIL,
          password: config.ADMIN_PASSWORD,
          role: "admin",
          isVerified: true,
          emailVerified: true,
        });
        await admin.save();
        logger.info("Initial administrator account created securely.");
      } else {
        admin.role = "admin";
        admin.password = config.ADMIN_PASSWORD;
        await admin.save();
        logger.info("Administrator account verified and synchronized.");
      }
    }

    // 3. Auto-seed initial catalog/data if empty
    const productCount = await require("./models/Product").countDocuments();
    if (productCount === 0) {
      logger.info("Catalog empty: seeding initial products, categories, jobs, and partners...");
      const seedDatabase = require("./seed");
      await seedDatabase(false);
    }

    // 3. Start listening
    const server = app.listen(config.PORT, () => {
      logger.info(`Vespera Enterprise Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      logger.info(`API Base URL: http://localhost:${config.PORT}/api`);
    });

    // Unhandled promise rejection handling
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Promise Rejection", { error: err.message, stack: err.stack });
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
};

startServer();
