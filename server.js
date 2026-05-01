require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./src/config/db");
const logger = require("./src/config/logger");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.APP_ENV}]`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();