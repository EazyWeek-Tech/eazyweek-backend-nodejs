const sql = require("mssql");
const logger = require("./logger");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;

const connectDB = async () => {
  pool = await new sql.ConnectionPool(config).connect();
  logger.info("Connected to SQL Server");
  return pool;
};

const getPool = () => {
  if (!pool) throw new Error("DB not initialised. Call connectDB() first.");
  return pool;
};

module.exports = { sql, connectDB, getPool };
