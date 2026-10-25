const pool = require("../db");

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

async function getWaitlists() {
  const [rows] = await pool.query(
    `SELECT
       e.Name,
       SUM(w.Status = 'Waiting') AS Waiting,
       SUM(w.Status = 'Notified') AS Notified
     FROM exhibition e
     JOIN waitlist w
       ON w.ExhibitionID = e.ExhibitionID
     WHERE e.IsDeleted = 0
       AND e.CancelledAt IS NULL
       AND w.Status IN ('Waiting', 'Notified')
     GROUP BY e.ExhibitionID, e.Name
     ORDER BY e.Name`
  );

  return rows;
}

async function getAlerts() {
  const alerts = [];

  const cancelledExhibitions = await getCancelledExhibitions();
  for (const exhibition of cancelledExhibitions) {
    alerts.push({
      Paths: ["/tickets", "/exhibitions"],
      Message:
        exhibition.Name +
        " was cancelled: " +
        Number(exhibition.PendingNotices) +
        " to notify, " +
        Number(exhibition.PendingRefunds) +
        " refunds pending",
    });
  }

  const waitlists = await getWaitlists();
  for (const waitlist of waitlists) {
    alerts.push({
      Paths: ["/tickets"],
      Message:
        waitlist.Name +
        " waitlist: " +
        Number(waitlist.Waiting) +
        " waiting, " +
        Number(waitlist.Notified) +
        " notified",
    });
  }

  return { status: 200, data: alerts };
}

module.exports = [
  { method: "GET", path: "/api/alerts", handler: getAlerts },
];
