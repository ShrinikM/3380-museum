const pool = require("../db");

async function getSmallCollections() {
  const [rows] = await pool.query(
    `SELECT
       collection.Name,
       COUNT(artwork.ArtworkID) AS ArtworkCount
     FROM collection
     LEFT JOIN artwork
       ON artwork.CollectionID = collection.CollectionID
       AND artwork.IsDeleted = 0
     WHERE collection.IsDeleted = 0
     GROUP BY collection.CollectionID, collection.Name
     HAVING COUNT(artwork.ArtworkID) < 2
     ORDER BY collection.Name`
  );

  return rows;
}

async function getCancelledExhibitions() {
  const [rows] = await pool.query(
    `SELECT
       e.Name,
       SUM(t.NotificationStatus = 'Pending') AS PendingNotices,
       SUM(t.RefundStatus = 'Pending') AS PendingRefunds
     FROM exhibition e
     JOIN ticket t
       ON t.ExhibitionID = e.ExhibitionID
      AND t.IsDeleted = 0
     WHERE e.IsDeleted = 0
       AND e.CancelledAt IS NOT NULL
     GROUP BY e.ExhibitionID, e.Name
     HAVING PendingNotices > 0 OR PendingRefunds > 0
     ORDER BY e.Name`
  );

  return rows;
}

async function getAlerts() {
  const alerts = [];

  const smallCollections = await getSmallCollections();
  for (const collection of smallCollections) {
    alerts.push({
      Path: "/collections",
      Message: collection.Name + " needs at least 2 artworks",
    });
  }

  const cancelledExhibitions = await getCancelledExhibitions();
  for (const exhibition of cancelledExhibitions) {
    alerts.push({
      Path: "/tickets",
      Message:
        exhibition.Name +
        " was cancelled: " +
        Number(exhibition.PendingNotices) +
        " to notify, " +
        Number(exhibition.PendingRefunds) +
        " refunds pending",
    });
  }

  return { status: 200, data: alerts };
}

module.exports = [
  { method: "GET", path: "/api/alerts", handler: getAlerts },
];
