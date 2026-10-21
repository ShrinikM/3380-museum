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

async function getRecentActivity(kinds) {
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
       UNION ALL
       SELECT
         artist.CreatedAt,
         'Artist',
         CONCAT('Artist added: ', artist.FirstName, ' ', artist.LastName),
         artist.CreatedBy
       FROM artist
       WHERE artist.IsDeleted = 0
       UNION ALL
       SELECT
         collection.CreatedAt,
         'Collection',
         CONCAT('Collection added: ', collection.Name),
         collection.CreatedBy
       FROM collection
       WHERE collection.IsDeleted = 0
     ) AS activity
     LEFT JOIN staff ON staff.StaffID = activity.StaffID
     WHERE activity.Kind IN (?)
     ORDER BY activity.At DESC
     LIMIT 30`,
    [kinds]
  );

  return rows;
}

async function getRole(staffId) {
  const [rows] = await pool.query(
    "SELECT Role FROM staff WHERE StaffID = ? AND IsDeleted = 0",
    [staffId]
  );

  if (rows.length === 0) {
    throw makeError(403, "Your account cannot view the dashboard");
  }

  return rows[0].Role;
}

async function getCount(table, extraWhere) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS Total FROM " + table + " WHERE IsDeleted = 0" + extraWhere
  );

  return Number(rows[0].Total);
}

async function getActiveExhibitionCount() {
  return getCount("exhibition", " AND StartDate <= CURDATE() AND EndDate >= CURDATE()");
}

async function getExhibitionArtworks() {
  const [rows] = await pool.query(
    `SELECT
       exhibition.ExhibitionID,
       exhibition.Name,
       DATE_FORMAT(exhibition.EndDate, '%Y-%m-%d') AS EndDate,
       COUNT(artwork.ArtworkID) AS ArtworkCount
     FROM exhibition
     LEFT JOIN artworkexhibition
       ON artworkexhibition.ExhibitionID = exhibition.ExhibitionID
     LEFT JOIN artwork
       ON artwork.ArtworkID = artworkexhibition.ArtworkID
       AND artwork.IsDeleted = 0
     WHERE exhibition.IsDeleted = 0
       AND exhibition.StartDate <= CURDATE()
       AND exhibition.EndDate >= CURDATE()
     GROUP BY exhibition.ExhibitionID, exhibition.Name, exhibition.EndDate
     ORDER BY exhibition.EndDate, exhibition.Name`
  );

  for (const row of rows) {
    row.ArtworkCount = Number(row.ArtworkCount);
  }

  return rows;
}

async function getCollectionSizes() {
  const [rows] = await pool.query(
    `SELECT
       collection.CollectionID,
       collection.Name,
       COUNT(artwork.ArtworkID) AS Artworks
     FROM collection
     LEFT JOIN artwork
       ON artwork.CollectionID = collection.CollectionID
       AND artwork.IsDeleted = 0
     WHERE collection.IsDeleted = 0
     GROUP BY collection.CollectionID, collection.Name
     ORDER BY Artworks DESC, collection.Name`
  );

  for (const row of rows) {
    row.Artworks = Number(row.Artworks);
  }

  return rows;
}

async function getAdminDashboard(params) {
  const ranges = getRanges(params);

  const revenue = await getRevenue(ranges.start, ranges.end);
  const counts = await getCounts(ranges.start, ranges.end);
  const artworks = await getCount("artwork", "");

  const data = {
    role: "Admin",
    start: ranges.start,
    end: ranges.end,
    tiles: [
      { label: "Total Artworks", value: artworks, format: "number" },
      { label: "Tickets Sold", value: counts.Tickets, format: "number" },
      { label: "Revenue", value: sumRevenue(revenue), format: "money" },
      { label: "New Memberships", value: counts.NewMembers, format: "number" },
    ],
    revenueBySource: revenue,
    collection: await getCollectionBreakdown(),
    topExhibitions: await getTopExhibitions(ranges.start, ranges.end),
    currentExhibitions: await getCurrentExhibitions(),
    activity: await getRecentActivity([
      "Ticket", "Gift Shop", "Cafe", "Membership", "Donation", "Artwork", "Artist", "Collection",
    ]),
  };

  return { status: 200, data: data };
}

async function getStaffDashboard() {
  const data = {
    role: "Staff",
    tiles: [
      { label: "Total Artworks", value: await getCount("artwork", ""), format: "number" },
      { label: "Total Artists", value: await getCount("artist", ""), format: "number" },
      { label: "Collections", value: await getCount("collection", ""), format: "number" },
      { label: "Active Exhibitions", value: await getActiveExhibitionCount(), format: "number" },
    ],
    collection: await getCollectionBreakdown(),
    collectionSizes: await getCollectionSizes(),
    exhibitionArtworks: await getExhibitionArtworks(),
    activity: await getRecentActivity(["Artwork", "Artist", "Collection"]),
  };

  return { status: 200, data: data };
}

async function getOperatorDashboard(params) {
  const ranges = getRanges(params);

  const revenue = await getRevenue(ranges.start, ranges.end);
  const counts = await getCounts(ranges.start, ranges.end);

  let storeSales = 0;
  const sources = [];
  for (const row of revenue) {
    if (row.Source === "Gift Shop" || row.Source === "Cafe") {
      storeSales = storeSales + row.Revenue;
    }
    if (row.Source !== "Donations") {
      sources.push(row);
    }
  }

  const data = {
    role: "Operator",
    start: ranges.start,
    end: ranges.end,
    tiles: [
      { label: "Tickets Sold", value: counts.Tickets, format: "number" },
      { label: "Store Sales", value: Math.round(storeSales * 100) / 100, format: "money" },
      { label: "New Memberships", value: counts.NewMembers, format: "number" },
      { label: "Active Exhibitions", value: await getActiveExhibitionCount(), format: "number" },
    ],
    revenueBySource: sources,
    topExhibitions: await getTopExhibitions(ranges.start, ranges.end),
    currentExhibitions: await getCurrentExhibitions(),
    activity: await getRecentActivity(["Ticket", "Gift Shop", "Cafe", "Membership"]),
  };

  return { status: 200, data: data };
}

async function getDashboard(params, body, staffId) {
  const role = await getRole(staffId);

  if (role === "Admin") {
    return getAdminDashboard(params);
  }
  if (role === "Staff") {
    return getStaffDashboard();
  }
  if (role === "Operator") {
    return getOperatorDashboard(params);
  }

  throw makeError(403, "Your role cannot view the dashboard");
}

module.exports = [
  { method: "GET", path: "/api/dashboard", handler: getDashboard, needsActor: true },
];
