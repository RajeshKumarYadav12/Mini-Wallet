const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const transferRoutes = require("./routes/transfer.routes");

/**
 * Express Application Setup
 */
const app = express();

// CORS configuration - Allow all origins in production (adjust as needed)
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For Vercel serverless - connect to DB on each request
let dbConnected = false;
const ensureDbConnection = async () => {
  if (!dbConnected) {
    const { connectDB } = require("./config/db");
    await connectDB();
    dbConnected = true;
  }
};

// Middleware to ensure DB connection (must be before routes)
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(503).json({
      success: false,
      error: "Service temporarily unavailable",
    });
  }
});

// Request logging middleware (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Mini-Wallet API",
  });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/transfer", transferRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate entry",
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

module.exports = app;
