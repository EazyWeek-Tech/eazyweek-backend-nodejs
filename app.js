const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { morganMiddleware } = require("./src/middlewares/logger.middleware");
const { errorHandler } = require("./src/middlewares/error.middleware");
const { rateLimiter } = require("./src/middlewares/rateLimiter.middleware");
const router = require("./src/routes");

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));

// Rate limiting
app.use("/api/", rateLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morganMiddleware);

// Health check (no auth required)
app.get("/", (req, res) => res.json({ message: "Eazyweek API is running", version: "1.0.0" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", env: process.env.APP_ENV, timestamp: new Date() }));

// All API routes
app.use("/api", router);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` }));

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
