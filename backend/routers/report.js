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
       artwork.YearCreated,
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
  addRange("term.StartDate", dates, conditions, values);

  const [rows] = await pool.query(
    `SELECT
       membership.MembershipID,
       CONCAT(customer.FirstName, ' ', customer.LastName) AS MemberName,
       customer.Email,
       term.MembershipType,
       DATE_FORMAT(term.StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(term.EndDate, '%Y-%m-%d') AS EndDate,
       term.Price,
       term.DiscountPercent,
       term.PaymentMethod
     FROM membershipterm term
     JOIN membership ON membership.MembershipID = term.MembershipID
     JOIN customer ON customer.CustomerID = membership.CustomerID
     WHERE membership.IsDeleted = 0` + joinConditions(conditions) + `
     ORDER BY term.StartDate`,
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

function getRange(column, dates) {
  const conditions = [];
  const values = [];
  addRange(column, dates, conditions, values);

  return { where: joinConditions(conditions), values: values };
}

async function getRevenueReport(params, body, staffId) {
  const dates = readDates(params);
  const tickets = getRange("SaleDate", dates);
  const giftShop = getRange("SaleDate", dates);
  const cafe = getRange("SaleDate", dates);
  const memberships = getRange("term.StartDate", dates);
  const donations = getRange("DonationDate", dates);

  const [rows] = await pool.query(
    `SELECT 'Tickets' AS Source, COALESCE(SUM(Price), 0) AS Revenue
     FROM ticket
     WHERE IsDeleted = 0 AND RefundStatus <> 'Refunded'` + tickets.where + `
     UNION ALL
     SELECT 'Gift Shop' AS Source, COALESCE(SUM(SalePrice * Quantity), 0) AS Revenue
     FROM giftshopsale
     WHERE IsDeleted = 0` + giftShop.where + `
     UNION ALL
     SELECT 'Cafe' AS Source, COALESCE(SUM(SalePrice * Quantity), 0) AS Revenue
     FROM cafesale
     WHERE IsDeleted = 0` + cafe.where + `
     UNION ALL
     SELECT 'Memberships' AS Source, COALESCE(SUM(term.Price), 0) AS Revenue
     FROM membershipterm term
     JOIN membership ON membership.MembershipID = term.MembershipID
     WHERE membership.IsDeleted = 0` + memberships.where + `
     UNION ALL
     SELECT 'Donations' AS Source, COALESCE(SUM(AmountDonated), 0) AS Revenue
     FROM donations
     WHERE IsDeleted = 0` + donations.where,
    tickets.values.concat(
      giftShop.values,
      cafe.values,
      memberships.values,
      donations.values
    )
  );

  let total = 0;
  for (const row of rows) {
    row.Revenue = Number(row.Revenue);
    total = total + row.Revenue;
  }

  for (const row of rows) {
    if (total > 0) {
      row.PercentOfTotal = Math.round((row.Revenue / total) * 1000) / 10;
    } else {
      row.PercentOfTotal = 0;
    }
  }

  return { status: 200, data: rows };
}

async function getTicketSalesReport(params, body, staffId) {
  const dates = readDates(params);
  const tickets = getRange("ticket.SaleDate", dates);

  const [rows] = await pool.query(
    `SELECT
       exhibition.ExhibitionID,
       exhibition.Name,
       COUNT(ticket.TicketID) AS TicketsSold,
       COALESCE(SUM(ticket.Price), 0) AS Revenue,
       exhibition.Capacity
     FROM exhibition
     LEFT JOIN ticket
       ON ticket.ExhibitionID = exhibition.ExhibitionID
       AND ticket.IsDeleted = 0
       AND ticket.RefundStatus <> 'Refunded'` + tickets.where + `
     WHERE exhibition.IsDeleted = 0
     GROUP BY exhibition.ExhibitionID, exhibition.Name, exhibition.Capacity
     ORDER BY TicketsSold DESC, exhibition.Name`,
    tickets.values
  );

  for (const row of rows) {
    row.TicketsSold = Number(row.TicketsSold);
    row.Revenue = Number(row.Revenue);
    row.Capacity = Number(row.Capacity);

    if (row.Capacity > 0) {
      row.PercentFull = Math.round((row.TicketsSold / row.Capacity) * 1000) / 10;
    } else {
      row.PercentFull = 0;
    }
  }

  return { status: 200, data: rows };
}

async function getMembershipTypesReport(params, body, staffId) {
  const dates = readDates(params);
  const memberships = getRange("term.StartDate", dates);

  const [rows] = await pool.query(
    `SELECT
       term.MembershipType,
       COUNT(*) AS Members,
       COALESCE(SUM(term.Price), 0) AS Revenue,
       ROUND(AVG(term.DiscountPercent), 1) AS AverageDiscount
     FROM membershipterm term
     JOIN membership ON membership.MembershipID = term.MembershipID
     WHERE membership.IsDeleted = 0` + memberships.where + `
     GROUP BY term.MembershipType
     ORDER BY FIELD(term.MembershipType, 'Individual', 'Family', 'Student', 'Senior')`,
    memberships.values
  );

  for (const row of rows) {
    row.Members = Number(row.Members);
    row.Revenue = Number(row.Revenue);
    row.AverageDiscount = Number(row.AverageDiscount);
  }

  return { status: 200, data: rows };
}

async function getItemRevenue(params, saleTable, itemTable) {
  const dates = readDates(params);
  const sales = getRange("sale.SaleDate", dates);

  const [rows] = await pool.query(
    `SELECT
       item.ItemID,
       item.ItemName,
       item.Category,
       SUM(sale.Quantity) AS UnitsSold,
       SUM(sale.SalePrice * sale.Quantity) AS Revenue
     FROM ` + saleTable + ` AS sale
     JOIN ` + itemTable + ` AS item ON item.ItemID = sale.ItemID
     WHERE sale.IsDeleted = 0` + sales.where + `
     GROUP BY item.ItemID, item.ItemName, item.Category
     ORDER BY Revenue DESC, item.ItemName`,
    sales.values
  );

  let total = 0;
  for (const row of rows) {
    row.UnitsSold = Number(row.UnitsSold);
    row.Revenue = Number(row.Revenue);
    total = total + row.Revenue;
  }

  for (const row of rows) {
    if (total > 0) {
      row.PercentOfTotal = Math.round((row.Revenue / total) * 1000) / 10;
    } else {
      row.PercentOfTotal = 0;
    }
  }

  return { status: 200, data: rows };
}

async function getGiftShopItemsReport(params, body, staffId) {
  return getItemRevenue(params, "giftshopsale", "giftshop");
}

async function getCafeItemsReport(params, body, staffId) {
  return getItemRevenue(params, "cafesale", "cafe");
}

async function getCollectionDistributionReport(params, body, staffId) {
  const [rows] = await pool.query(
    `SELECT 
        collection.CollectionID,
        collection.Name AS CollectionName,
        COUNT(artwork.ArtworkID) AS TotalArtworks,
        MIN(artwork.YearCreated) AS OldestArtworkYear,
        MAX(artwork.YearCreated) AS NewestArtworkYear
    FROM collection
    LEFT JOIN artwork ON collection.CollectionID = artwork.CollectionID AND artwork.IsDeleted = 0
    WHERE collection.IsDeleted = 0
    GROUP BY collection.CollectionID, collection.Name
    ORDER BY TotalArtworks DESC, collection.Name`
  );

  for (const row of rows) {
    row.TotalArtworks = Number(row.TotalArtworks);
    row.OldestArtworkYear = row.OldestArtworkYear ? Number(row.OldestArtworkYear) : null;
    row.NewestArtworkYear = row.NewestArtworkYear ? Number(row.NewestArtworkYear) : null;
  }

  return { status: 200, data: rows };
}

async function getVisitorTrafficReport(params, body, staffId) {
  const dates = readDates(params);
  const tickets = getRange("SaleDate", dates);

  const [rows] = await pool.query(
    `SELECT
      HOUR(SaleDate) AS HourOfDay,
      COUNT(TicketID) AS TicketsSold,
      COALESCE(SUM(Price), 0) AS Revenue
    FROM ticket
    WHERE IsDeleted = 0 AND RefundStatus <> 'Refunded'` + tickets.where + `
    GROUP BY HOUR(SaleDate)
    ORDER BY HourOfDay`,
    tickets.values
  );

  for (const row of rows) {
    row.HourOfDay = Number(row.HourOfDay);
    row.TicketsSold = Number(row.TicketsSold);
    row.Revenue = Number(row.Revenue);
  }

  return { status: 200, data: rows };
}

async function getMembershipExpirationReport(params, body, staffId) {
  const [rows] = await pool.query(
    `SELECT
      membership.MembershipID,
      CONCAT(customer.FirstName, ' ', customer.LastName) AS MemberName,
      customer.Email,
      term.MembershipType,
      DATE_FORMAT(term.StartDate, '%Y-%m-%d') AS StartDate,
      DATE_FORMAT(term.EndDate, '%Y-%m-%d') AS EndDate,
      DATEDIFF(term.EndDate, CURDATE()) AS DaysUntilExpiration
    FROM membershipterm term
    JOIN membership ON membership.MembershipID = term.MembershipID
    JOIN customer ON customer.CustomerID = membership.CustomerID
    WHERE membership.IsDeleted = 0 AND term.EndDate >= CURDATE()
    ORDER BY DaysUntilExpiration ASC`
  );

  for (const row of rows) {
    row.DaysUntilExpiration = Number(row.DaysUntilExpiration);
  }

  return { status: 200, data: rows };
}

async function getArtworkAcquisitionTimelineReport(params, body, staffId) {
  const dates = readDates(params);
  const conditions = [];
  const values = [];
  addRange("DATE(artwork.CreatedAt)", dates, conditions, values);

  const [rows] = await pool.query(
    `SELECT
      YEAR(artwork.CreatedAt) AS AcquisitionYear,
      COUNT(artwork.ArtworkID) AS ArtworksAcquired
    FROM artwork
    WHERE artwork.IsDeleted = 0` + joinConditions(conditions) + `
    GROUP BY YEAR(artwork.CreatedAt)
    ORDER BY AcquisitionYear ASC`,
    values
  );

  for (const row of rows) {
    row.AcquisitionYear = Number(row.AcquisitionYear);
    row.ArtworksAcquired = Number(row.ArtworksAcquired);
  }

  return { status: 200, data: rows };
}

async function getReportSummaryStats(params, body, staffId) {
  const [expiringRows] = await pool.query(
    `SELECT COUNT(term.MembershipID) AS ExpiringSoon 
     FROM membershipterm term
     JOIN membership ON membership.MembershipID = term.MembershipID
     WHERE membership.IsDeleted = 0 
     AND term.EndDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
  );

  const [exhibRows] = await pool.query(
    `SELECT 
      COALESCE(AVG((SELECT COUNT(TicketID) FROM ticket t WHERE t.ExhibitionID = exhibition.ExhibitionID AND t.IsDeleted = 0 AND t.RefundStatus <> 'Refunded') / NULLIF(Capacity, 0) * 100), 0) AS AvgCapacity
    FROM exhibition 
    WHERE IsDeleted = 0 AND Capacity > 0`
  );

  const [artRows] = await pool.query(
    `SELECT COUNT(ArtworkID) AS TotalArtworks FROM artwork WHERE IsDeleted = 0`
  );

  const [memberRows] = await pool.query(
    `SELECT COUNT(DISTINCT term.MembershipID) AS ActiveMembers 
     FROM membershipterm term
     JOIN membership ON membership.MembershipID = term.MembershipID
     WHERE membership.IsDeleted = 0 AND term.EndDate >= CURDATE()`
  );

  return {
    status: 200,
    data: {
      expiringSoon: Number(expiringRows[0]?.ExpiringSoon || 0),
      avgCapacity: Math.round(Number(exhibRows[0]?.AvgCapacity || 0)),
      totalArtworks: Number(artRows[0]?.TotalArtworks || 0),
      activeMembers: Number(memberRows[0]?.ActiveMembers || 0),
    },
  };
}

module.exports = [
  { method: "GET", path: "/api/reports/collection", handler: getCollectionReport },
  { method: "GET", path: "/api/reports/collection-distribution", handler: getCollectionDistributionReport },
  { method: "GET", path: "/api/reports/artwork-timeline", handler: getArtworkAcquisitionTimelineReport },
  { method: "GET", path: "/api/reports/visitor-traffic", handler: getVisitorTrafficReport },
  { method: "GET", path: "/api/reports/membership-expiration", handler: getMembershipExpirationReport },
  { method: "GET", path: "/api/reports/exhibitions", handler: getExhibitionReport },
  { method: "GET", path: "/api/reports/memberships", handler: getMembershipReport },
  { method: "GET", path: "/api/reports/sales", handler: getSalesReport },
  { method: "GET", path: "/api/reports/revenue", handler: getRevenueReport },
  { method: "GET", path: "/api/reports/ticket-sales", handler: getTicketSalesReport },
  { method: "GET", path: "/api/reports/membership-types", handler: getMembershipTypesReport },
  { method: "GET", path: "/api/reports/giftshop-items", handler: getGiftShopItemsReport },
  { method: "GET", path: "/api/reports/cafe-items", handler: getCafeItemsReport },
  { method: "GET", path: "/api/reports/summary-stats", handler: getReportSummaryStats },
];