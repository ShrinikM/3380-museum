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

async function getAlerts() {
  const alerts = [];

  const smallCollections = await getSmallCollections();
  for (const collection of smallCollections) {
    alerts.push({
      Path: "/collections",
      Message: collection.Name + " needs at least 2 artworks",
    });
  }

  return { status: 200, data: alerts };
}

module.exports = [
  { method: "GET", path: "/api/alerts", handler: getAlerts },
];
