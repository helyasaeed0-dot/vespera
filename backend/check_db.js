const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const Category = require("./models/Category");
const Order = require("./models/Order");
const Career = require("./models/Career");
const JobApplication = require("./models/JobApplication");
const Partner = require("./models/Partner");
const Review = require("./models/Review");

async function checkDatabase() {
  console.log("\n==============================================");
  console.log("   VESPERA ENTERPRISE - DATABASE HEALTH CHECK  ");
  console.log("==============================================\n");

  try {
    await connectDB();

    const dbState = mongoose.connection.readyState;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    console.log(`[STATUS] Database Connection: ${states[dbState] || "Unknown"}`);
    console.log(`[HOST]   Connected to: ${mongoose.connection.host}`);
    console.log(`[NAME]   Database Name: ${mongoose.connection.name}\n`);

    console.log("--- Collection Document Counts ---");
    const [
      userCount,
      productCount,
      categoryCount,
      orderCount,
      careerCount,
      appCount,
      partnerCount,
      reviewCount,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Career.countDocuments(),
      JobApplication.countDocuments(),
      Partner.countDocuments(),
      Review.countDocuments(),
    ]);

    console.table([
      { Collection: "Users", Documents: userCount, Status: userCount > 0 ? "OK" : "Empty" },
      { Collection: "Products", Documents: productCount, Status: productCount > 0 ? "OK" : "Empty" },
      { Collection: "Categories", Documents: categoryCount, Status: categoryCount > 0 ? "OK" : "Empty" },
      { Collection: "Orders", Documents: orderCount, Status: orderCount > 0 ? "OK" : "Empty" },
      { Collection: "Careers / Jobs", Documents: careerCount, Status: careerCount > 0 ? "OK" : "Empty" },
      { Collection: "Job Applications", Documents: appCount, Status: appCount > 0 ? "OK" : "Empty" },
      { Collection: "Partners", Documents: partnerCount, Status: partnerCount > 0 ? "OK" : "Empty" },
      { Collection: "Reviews", Documents: reviewCount, Status: reviewCount > 0 ? "OK" : "Empty" },
    ]);

    console.log("\n[SUCCESS] Database is fully operational and accessible!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n[ERROR] Database Check Failed:", error.message);
    process.exit(1);
  }
}

checkDatabase();
