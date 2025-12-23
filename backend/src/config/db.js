const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Database configuration using Mongoose
 * Connects to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mini_wallet",
      {
        // These options are now default in Mongoose 6+
        // But keeping for clarity
      }
    );

    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✓ Database connection established successfully");
      return true;
    }
    await connectDB();
    return true;
  } catch (error) {
    console.error("✗ Unable to connect to database:", error.message);
    return false;
  }
};

/**
 * Disconnect from database
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("✓ MongoDB disconnected");
  } catch (error) {
    console.error("✗ Error disconnecting from MongoDB:", error.message);
  }
};

module.exports = {
  connectDB,
  testConnection,
  disconnectDB,
  mongoose,
};
