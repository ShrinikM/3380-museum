const pool = require("./db");

async function getPaymentMethods(usedFor) {
  const [rows] = await pool.query(
    `SELECT MethodName
     FROM paymentmethod
     WHERE UsedFor = ?
     ORDER BY SortOrder, MethodName`,
    [usedFor]
  );

  return rows.map((row) => row.MethodName);
}

module.exports = { getPaymentMethods };