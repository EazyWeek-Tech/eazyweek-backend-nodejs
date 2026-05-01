require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./src/config/db");
const logger = require("./src/config/logger");

const PORT = process.env.PORT || 8080;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "eazyweek-beta-api",
    env: process.env.APP_ENV || "beta",
  });
});

app.get("/", (req, res) => {
  res.send("Eazyweek Beta API is running");
});

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT} [${process.env.APP_ENV || "beta"}]`);

  try {
    await connectDB();
    logger.info("Database connected successfully");
  } catch (err) {
    logger.error("Database connection failed:", err);
  }
});