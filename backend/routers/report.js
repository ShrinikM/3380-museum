const pool = require("../db");

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function checkDate(value, fieldName) {
  const date = new Date(value);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw makeError(400, fieldName + " must be a real date like 2026-01-31");
  }

  const today = new Date().toISOString().slice(0, 10);
  if (value > today) {
    throw makeError(400, fieldName + " cannot be in the future");
  }

  return value;
}

function readDates(params) {
  const dates = { start: null, end: null };

  if (params.start !== undefined && params.start !== "") {
    dates.start = checkDate(params.start, "start");
  }
  if (params.end !== undefined && params.end !== "") {
    dates.end = checkDate(params.end, "end");
  }
  if (dates.start !== null && dates.end !== null && dates.start > dates.end) {
    throw makeError(400, "start cannot be after end");
  }

  return dates;
}

function addRange(column, dates, conditions, values) {
  if (dates.start !== null) {
    conditions.push(column + " >= ?");
    values.push(dates.start);
  }
  if (dates.end !== null) {
    conditions.push(column + " <= ?");
    values.push(dates.end);
  }
}

function joinConditions(conditions) {
  if (conditions.length === 0) {
    return "";
  }
  return " AND " + conditions.join(" AND ");
}

async function getCollectionReport(params, body, staffId) {
  const dates = readDates(params);
  const conditions = [];
  const values = [];
  addRange("DATE(artwork.CreatedAt)", dates, conditions, values);

  const [rows] = await pool.query(
    `SELECT
       artwork.ArtworkID,
       artwork.Title,
       artwork.Type,
       DATE_FORMAT(artwork.DateCreated, '%Y-%m-%d') AS DateCreated,
       CONCAT(artist.FirstName, ' ', artist.LastName) AS ArtistName,
       collection.Name AS CollectionName,
       DATE_FORMAT(artwork.CreatedAt, '%Y-%m-%d') AS DateAdded
     FROM artwork
     JOIN artist ON artist.ArtistID = artwork.ArtistID
     JOIN collection ON collection.CollectionID = artwork.CollectionID
     WHERE artwork.IsDeleted = 0` + joinConditions(conditions) + `
     ORDER BY collection.Name, artwork.Title`,
    values
  );

  return { status: 200, data: rows };
}

async function getExhibitionReport(params, body, staffId) {
  const dates = readDates(params);
  const conditions = [];
  const values = [];

  if (dates.start !== null) {
    conditions.push("EndDate >= ?");
    values.push(dates.start);
  }
  if (dates.end !== null) {
    conditions.push("StartDate <= ?");
    values.push(dates.end);
  }

  const [rows] = await pool.query(
    `SELECT
       ExhibitionID,
       Name,
       DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
       Description,
       Capacity
     FROM exhibition
     WHERE IsDeleted = 0` + joinConditions(conditions) + `
     ORDER BY StartDate`,
    values
  );

  return { status: 200, data: rows };
}

async function getMembershipReport(params, body, staffId) {
  const dates = readDates(params);
  const conditions = [];
  const values = [];
  addRange("StartDate", dates, conditions, values);

  const [rows] = await pool.query(
    `SELECT
       MembershipID,
       CONCAT(FirstName, ' ', LastName) AS MemberName,
       Email,
       MembershipType,
       DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
       Price,
       DiscountPercent,
       PaymentMethod
     FROM membership
     WHERE IsDeleted = 0` + joinConditions(conditions) + `
     ORDER BY StartDate`,
    values
  );

  return { status: 200, data: rows };
}

async function getSalesReport(params, body, staffId) {
  const dates = readDates(params);
  const conditions = [];
  const values = [];
  addRange("sale.SaleDate", dates, conditions, values);
  const where = joinConditions(conditions);

  const [rows] = await pool.query(
    `SELECT
       'Gift Shop' AS Shop,
       sale.SaleID,
       item.ItemName,
       sale.Quantity,
       sale.SalePrice,
       sale.Quantity * sale.SalePrice AS Total,
       DATE_FORMAT(sale.SaleDate, '%Y-%m-%d') AS SaleDate,
       sale.PaymentMethod
     FROM giftshopsale AS sale
     JOIN giftshop AS item ON item.ItemID = sale.ItemID
     WHERE sale.IsDeleted = 0` + where + `
     UNION ALL
     SELECT
       'Cafe' AS Shop,
       sale.SaleID,
       item.ItemName,
       sale.Quantity,
       sale.SalePrice,
       sale.Quantity * sale.SalePrice AS Total,
       DATE_FORMAT(sale.SaleDate, '%Y-%m-%d') AS SaleDate,
       sale.PaymentMethod
     FROM cafesale AS sale
     JOIN cafe AS item ON item.ItemID = sale.ItemID
     WHERE sale.IsDeleted = 0` + where + `
     ORDER BY SaleDate, Shop`,
    values.concat(values)
  );

  return { status: 200, data: rows };
}

module.exports = [
  { method: "GET", path: "/api/reports/collection", handler: getCollectionReport },
  { method: "GET", path: "/api/reports/exhibitions", handler: getExhibitionReport },
  { method: "GET", path: "/api/reports/memberships", handler: getMembershipReport },
  { method: "GET", path: "/api/reports/sales", handler: getSalesReport },
];
