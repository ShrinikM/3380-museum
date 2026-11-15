const mysql = require("mysql2/promise");

if (!process.env.DB_PASSWORD) {
  console.warn("Error: DB_PASSWORD is not set");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "team3museum.mysql.database.azure.com",
  user: process.env.DB_USER || "Team3",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "museum",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: true,
  },
});

module.exports = pool;