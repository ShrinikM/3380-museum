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
    `SELECT 
      Month,
      SUM(Revenue) AS Revenue,
      SUM(Visitors) AS TotalVisitors
    FROM (
      SELECT DATE_FORMAT(SaleDate, '%b %y') AS Month, SUM(Price) AS Revenue, COUNT(TicketID) AS Visitors, MIN(SaleDate) AS SortDate
      FROM ticket
      WHERE IsDeleted = 0 AND RefundStatus <> 'Refunded'` + tickets.where + `
      GROUP BY DATE_FORMAT(SaleDate, '%b %y')
      UNION ALL
      SELECT DATE_FORMAT(SaleDate, '%b %y') AS Month, SUM(SalePrice * Quantity) AS Revenue, 0 AS Visitors, MIN(SaleDate) AS SortDate
      FROM giftshopsale
      WHERE IsDeleted = 0` + giftShop.where + `
      GROUP BY DATE_FORMAT(SaleDate, '%b %y')
      UNION ALL
      SELECT DATE_FORMAT(SaleDate, '%b %y') AS Month, SUM(SalePrice * Quantity) AS Revenue, 0 AS Visitors, MIN(SaleDate) AS SortDate
      FROM cafesale
      WHERE IsDeleted = 0` + cafe.where + `
      GROUP BY DATE_FORMAT(SaleDate, '%b %y')
      UNION ALL
      SELECT DATE_FORMAT(term.StartDate, '%b %y') AS Month, SUM(term.Price) AS Revenue, 0 AS Visitors, MIN(term.StartDate) AS SortDate
      FROM membershipterm term
      JOIN membership ON membership.MembershipID = term.MembershipID
      WHERE membership.IsDeleted = 0` + memberships.where + `
      GROUP BY DATE_FORMAT(term.StartDate, '%b %y')
      UNION ALL
      SELECT DATE_FORMAT(DonationDate, '%b %y') AS Month, SUM(AmountDonated) AS Revenue, 0 AS Visitors, MIN(DonationDate) AS SortDate
      FROM donations
      WHERE IsDeleted = 0` + donations.where + `
      GROUP BY DATE_FORMAT(DonationDate, '%b %y')
    ) combined
    GROUP BY Month
    ORDER BY MIN(SortDate) ASC`,
    tickets.values.concat(
      giftShop.values,
      cafe.values,
      memberships.values,
      donations.values
    )
  );

  let prevRevenue = null;
  for (const row of rows) {
    row.Revenue = Number(row.Revenue);
    row.TotalVisitors = Number(row.TotalVisitors);
    
    if (row.TotalVisitors > 0) {
      row.AvgSpendPerVisitor = Math.round((row.Revenue / row.TotalVisitors) * 100) / 100;
    } else {
      row.AvgSpendPerVisitor = 0;
    }

    if (prevRevenue !== null && prevRevenue > 0) {
      const growth = ((row.Revenue - prevRevenue) / prevRevenue) * 100;
      row.MonthOverMonthGrowth = Math.round(growth * 10) / 10;
    } else {
      row.MonthOverMonthGrowth = 0;
    }
    prevRevenue = row.Revenue;
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
  { method: "GET", path: "/api/reports/revenue", handler: getRevenueReport },
  { method: "GET", path: "/api/reports/ticket-sales", handler: getTicketSalesReport },
  { method: "GET", path: "/api/reports/giftshop-cafe", handler: getGiftShopItemsReport },
  { method: "GET", path: "/api/reports/membership-expiration", handler: getMembershipExpirationReport },
  { method: "GET", path: "/api/reports/summary-stats", handler: getReportSummaryStats },
];