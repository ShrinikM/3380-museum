const pool = require("../db");

const monthStart = "DATE_FORMAT(CURDATE(), '%Y-%m-01')";
const quarterStart = "(MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (QUARTER(CURDATE()) - 1) * 3 MONTH)";
const yearStart = "MAKEDATE(YEAR(CURDATE()), 1)";

async function getDashboard(params, body, staffId) {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM artist WHERE IsDeleted = 0) AS Artists,

      (SELECT COUNT(*) FROM artwork WHERE IsDeleted = 0) AS Artworks,

      (SELECT COUNT(*) FROM artwork
        WHERE IsDeleted = 0 AND DATE(CreatedAt) >= ${quarterStart}) AS ArtworksThisQuarter,

      (SELECT COUNT(*) FROM collection WHERE IsDeleted = 0) AS Collections,

      (SELECT COUNT(*) FROM exhibition
        WHERE IsDeleted = 0 AND StartDate <= CURDATE() AND EndDate >= CURDATE()) AS ActiveExhibitions,

      (SELECT COUNT(*) FROM exhibition
        WHERE IsDeleted = 0 AND StartDate >= ${monthStart} AND StartDate <= CURDATE()) AS ExhibitionsOpenedThisMonth,

      (SELECT COUNT(*) FROM ticket WHERE IsDeleted = 0) AS Tickets,

      (SELECT COUNT(*) FROM ticket
        WHERE IsDeleted = 0 AND SaleDate >= ${monthStart} AND SaleDate <= CURDATE()) AS TicketsThisMonth,

      (SELECT COUNT(*) FROM membership WHERE IsDeleted = 0) AS Memberships,

      (SELECT COUNT(*) FROM membership
        WHERE IsDeleted = 0 AND StartDate <= CURDATE() AND EndDate >= CURDATE()) AS ActiveMemberships,

      (SELECT COUNT(*) FROM membership
        WHERE IsDeleted = 0 AND StartDate >= ${monthStart} AND StartDate <= CURDATE()) AS MembershipsThisMonth,

      (SELECT COUNT(*) FROM giftshop WHERE IsDeleted = 0) AS GiftShopItems,

      (SELECT COUNT(*) FROM cafe WHERE IsDeleted = 0) AS CafeItems,

      (SELECT COALESCE(SUM(AmountDonated), 0) FROM donations
        WHERE IsDeleted = 0 AND DonationDate >= ${yearStart} AND DonationDate <= CURDATE()) AS DonationsYearToDate,

      (SELECT COUNT(*) FROM staff WHERE IsDeleted = 0) AS Staff
  `);

  const dashboard = {};
  for (const key of Object.keys(rows[0])) {
    dashboard[key] = Number(rows[0][key]);
  }

  return { status: 200, data: dashboard };
}

module.exports = [
  { method: "GET", path: "/api/dashboard", handler: getDashboard },
];
