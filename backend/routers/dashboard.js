const pool = require("../db");

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function checkDate(value, fieldName) {
  const date = new Date(value);

  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw makeError(400, fieldName + " must be a real date like 2026-01-31");
  }

  if (value > formatDate(new Date())) {
    throw makeError(400, fieldName + " cannot be in the future");
  }

  return value;
}

function getRanges(params) {
  const today = new Date();
  let start = today.getFullYear() + "-01-01";
  let end = formatDate(today);

  if (params.start !== undefined && params.start !== "") {
    start = checkDate(params.start, "start");
  }
  if (params.end !== undefined && params.end !== "") {
    end = checkDate(params.end, "end");
  }
  if (start > end) {
    throw makeError(400, "start cannot be after end");
  }

  return { start: start, end: end };
}

async function getRevenue(start, end) {
  const [rows] = await pool.query(
    `SELECT 'Tickets' AS Source, COALESCE(SUM(Price), 0) AS Revenue
     FROM ticket
     WHERE IsDeleted = 0 AND SaleDate >= ? AND SaleDate <= ?
     UNION ALL
     SELECT 'Gift Shop' AS Source, COALESCE(SUM(SalePrice * Quantity), 0) AS Revenue
     FROM giftshopsale
     WHERE IsDeleted = 0 AND SaleDate >= ? AND SaleDate <= ?
     UNION ALL
     SELECT 'Cafe' AS Source, COALESCE(SUM(SalePrice * Quantity), 0) AS Revenue
     FROM cafesale
     WHERE IsDeleted = 0 AND SaleDate >= ? AND SaleDate <= ?
     UNION ALL
     SELECT 'Memberships' AS Source, COALESCE(SUM(Price), 0) AS Revenue
     FROM membership
     WHERE IsDeleted = 0 AND StartDate >= ? AND StartDate <= ?
     UNION ALL
     SELECT 'Donations' AS Source, COALESCE(SUM(AmountDonated), 0) AS Revenue
     FROM donations
     WHERE IsDeleted = 0 AND DonationDate >= ? AND DonationDate <= ?`,
    [start, end, start, end, start, end, start, end, start, end]
  );

  for (const row of rows) {
    row.Revenue = Number(row.Revenue);
  }

  return rows;
}

async function getCounts(start, end) {
  const [rows] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM ticket
        WHERE IsDeleted = 0 AND SaleDate >= ? AND SaleDate <= ?) AS Tickets,
       (SELECT COUNT(*) FROM membership
        WHERE IsDeleted = 0 AND StartDate >= ? AND StartDate <= ?) AS NewMembers`,
    [start, end, start, end]
  );

  return {
    Tickets: Number(rows[0].Tickets),
    NewMembers: Number(rows[0].NewMembers),
  };
}

function sumRevenue(rows) {
  let total = 0;

  for (const row of rows) {
    total = total + row.Revenue;
  }

  return Math.round(total * 100) / 100;
}

async function getArtworkCount() {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS Artworks FROM artwork WHERE IsDeleted = 0"
  );

  return Number(rows[0].Artworks);
}

async function getCurrentExhibitions() {
  const [rows] = await pool.query(
    `SELECT
       exhibition.ExhibitionID,
       exhibition.Name,
       DATE_FORMAT(exhibition.EndDate, '%Y-%m-%d') AS EndDate,
       exhibition.Capacity,
       COUNT(ticket.TicketID) AS TicketsSold
     FROM exhibition
     LEFT JOIN ticket
       ON ticket.ExhibitionID = exhibition.ExhibitionID
       AND ticket.IsDeleted = 0
     WHERE exhibition.IsDeleted = 0
       AND exhibition.StartDate <= CURDATE()
       AND exhibition.EndDate >= CURDATE()
     GROUP BY exhibition.ExhibitionID, exhibition.Name, exhibition.EndDate, exhibition.Capacity
     ORDER BY exhibition.EndDate, exhibition.Name`
  );

  for (const row of rows) {
    row.Capacity = Number(row.Capacity);
    row.TicketsSold = Number(row.TicketsSold);

    if (row.Capacity > 0) {
      row.PercentFull = Math.round((row.TicketsSold / row.Capacity) * 1000) / 10;
    } else {
      row.PercentFull = 0;
    }
  }

  return rows;
}

async function getTopExhibitions(start, end) {
  const [rows] = await pool.query(
    `SELECT
       exhibition.ExhibitionID,
       exhibition.Name,
       DATE_FORMAT(exhibition.StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(exhibition.EndDate, '%Y-%m-%d') AS EndDate,
       exhibition.Capacity,
       COUNT(ticket.TicketID) AS TicketsSold,
       COALESCE(SUM(ticket.Price), 0) AS Revenue
     FROM ticket
     JOIN exhibition ON exhibition.ExhibitionID = ticket.ExhibitionID
     WHERE ticket.IsDeleted = 0
       AND exhibition.IsDeleted = 0
       AND ticket.SaleDate >= ?
       AND ticket.SaleDate <= ?
     GROUP BY exhibition.ExhibitionID, exhibition.Name, exhibition.StartDate, exhibition.EndDate, exhibition.Capacity
     ORDER BY TicketsSold DESC, exhibition.Name
     LIMIT 5`,
    [start, end]
  );

  for (const row of rows) {
    row.Capacity = Number(row.Capacity);
    row.TicketsSold = Number(row.TicketsSold);
    row.Revenue = Number(row.Revenue);
    row.AveragePrice = Math.round((row.Revenue / row.TicketsSold) * 100) / 100;

    if (row.Capacity > 0) {
      row.PercentOfCapacity = Math.round((row.TicketsSold / row.Capacity) * 1000) / 10;
    } else {
      row.PercentOfCapacity = 0;
    }
  }

  return rows;
}

async function getCollectionBreakdown() {
  const [rows] = await pool.query(
    `SELECT Type, COUNT(*) AS Artworks
     FROM artwork
     WHERE IsDeleted = 0
     GROUP BY Type
     ORDER BY Artworks DESC, Type`
  );

  for (const row of rows) {
    row.Artworks = Number(row.Artworks);
  }

  return rows;
}

async function getRecentActivity() {
  const [rows] = await pool.query(
    `SELECT
       activity.At,
       activity.Kind,
       activity.Description,
       CONCAT(staff.FirstName, ' ', staff.LastName) AS StaffName
     FROM (
       SELECT
         ticket.CreatedAt AS At,
         'Ticket' AS Kind,
         CONCAT(ticket.TicketType, ' ticket sold for ', exhibition.Name) AS Description,
         ticket.CreatedBy AS StaffID
       FROM ticket
       JOIN exhibition ON exhibition.ExhibitionID = ticket.ExhibitionID
       WHERE ticket.IsDeleted = 0
       UNION ALL
       SELECT
         giftshopsale.CreatedAt,
         'Gift Shop',
         CONCAT(giftshopsale.Quantity, ' x ', giftshop.ItemName, ' sold'),
         giftshopsale.CreatedBy
       FROM giftshopsale
       JOIN giftshop ON giftshop.ItemID = giftshopsale.ItemID
       WHERE giftshopsale.IsDeleted = 0
       UNION ALL
       SELECT
         cafesale.CreatedAt,
         'Cafe',
         CONCAT(cafesale.Quantity, ' x ', cafe.ItemName, ' sold'),
         cafesale.CreatedBy
       FROM cafesale
       JOIN cafe ON cafe.ItemID = cafesale.ItemID
       WHERE cafesale.IsDeleted = 0
       UNION ALL
       SELECT
         membership.CreatedAt,
         'Membership',
         CONCAT(membership.MembershipType, ' membership for ', membership.FirstName, ' ', membership.LastName),
         membership.CreatedBy
       FROM membership
       WHERE membership.IsDeleted = 0
       UNION ALL
       SELECT
         donations.CreatedAt,
         'Donation',
         CONCAT('Donation of $', donations.AmountDonated, ' from ', donations.FirstName, ' ', donations.LastName),
         donations.CreatedBy
       FROM donations
       WHERE donations.IsDeleted = 0
       UNION ALL
       SELECT
         artwork.CreatedAt,
         'Artwork',
         CONCAT('Artwork added: ', artwork.Title),
         artwork.CreatedBy
       FROM artwork
       WHERE artwork.IsDeleted = 0
     ) AS activity
     LEFT JOIN staff ON staff.StaffID = activity.StaffID
     ORDER BY activity.At DESC
     LIMIT 30`
  );

  return rows;
}

async function getDashboard(params, body, staffId) {
  const ranges = getRanges(params);

  const revenue = await getRevenue(ranges.start, ranges.end);
  const counts = await getCounts(ranges.start, ranges.end);
  const artworks = await getArtworkCount();
  const currentExhibitions = await getCurrentExhibitions();
  const topExhibitions = await getTopExhibitions(ranges.start, ranges.end);
  const collection = await getCollectionBreakdown();
  const activity = await getRecentActivity();

  const data = {
    start: ranges.start,
    end: ranges.end,
    artworks: artworks,
    tickets: counts.Tickets,
    revenue: sumRevenue(revenue),
    newMembers: counts.NewMembers,
    revenueBySource: revenue,
    currentExhibitions: currentExhibitions,
    topExhibitions: topExhibitions,
    collection: collection,
    activity: activity,
  };

  return { status: 200, data: data };
}

module.exports = [
  { method: "GET", path: "/api/dashboard", handler: getDashboard },
];
