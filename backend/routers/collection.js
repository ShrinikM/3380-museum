const pool = require("../db");

async function getCollections() {
  const [rows] = await pool.query(
    "SELECT CollectionID, Name FROM collection WHERE IsDeleted = 0 ORDER BY Name"
  );
  return { status: 200, data: rows };
}

module.exports = [
  { method: "GET", path: "/api/collections", handler: getCollections },
];
