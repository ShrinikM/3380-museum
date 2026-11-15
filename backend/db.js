const mysql = require("mysql2/promise");

if (!process.env.DB_PASSWORD) {
  console.warn("Error: DB_PASSWORD is not set");
}

const host = process.env.DB_HOST || "team3museum.mysql.database.azure.com";
const useSsl = host.endsWith(".mysql.database.azure.com");

const pool = mysql.createPool({
  host: host,
  user: process.env.DB_USER || "Team3",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "museum",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: useSsl ? { rejectUnauthorized: true } : undefined,
});

module.exports = pool;