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

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function last12MonthsStart() {
  const today = new Date();
  return formatDateValue(new Date(today.getFullYear(), today.getMonth() - 11, 1));
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

  if (dates.start === null && dates.end === null) {
    dates.start = last12MonthsStart();
    dates.end = formatDateValue(new Date());
  }

  return dates;
}

function dateFilter(column, dates, values) {
  let sql = "";

  if (dates.start !== null) {
    sql = sql + " AND " + column + " >= ?";
    values.push(dates.start);
  }
  if (dates.end !== null) {
    sql = sql + " AND " + column + " <= ?";
    values.push(dates.end);
  }

  return sql;
}

async function getRevenueReport(params) {
  const dates = readDates(params);
  const values = [];
  const ticketDates = dateFilter("ticket.SaleDate", dates, values);
  const giftDates = dateFilter("sale.SaleDate", dates, values);
  const cafeDates = dateFilter("sale.SaleDate", dates, values);
  const memberDates = dateFilter("term.StartDate", dates, values);
  const donationDates = dateFilter("DonationDate", dates, values);

  const [rows] = await pool.query(
    `SELECT
      Month,
      TicketRevenue,
      GiftShopRevenue,
      CafeRevenue,
      MembershipRevenue,
      DonationRevenue,
      Revenue,
      TotalVisitors,
      CASE
        WHEN TotalVisitors > 0 THEN ROUND(Revenue / TotalVisitors, 2)
        ELSE 0
      END AS AvgSpendPerVisitor,
      CASE
        WHEN PrevRevenue IS NULL OR PrevRevenue = 0 THEN 0
        ELSE ROUND(((Revenue - PrevRevenue) / PrevRevenue) * 100, 1)
      END AS MonthOverMonthGrowth
    FROM (
      SELECT
        Month,
        TicketRevenue,
        GiftShopRevenue,
        CafeRevenue,
        MembershipRevenue,
        DonationRevenue,
        Revenue,
        TotalVisitors,
        SortDate,
        LAG(Revenue) OVER (ORDER BY SortDate) AS PrevRevenue
      FROM (
        SELECT
          Month,
          SUM(TicketRevenue) AS TicketRevenue,
          SUM(GiftShopRevenue) AS GiftShopRevenue,
          SUM(CafeRevenue) AS CafeRevenue,
          SUM(MembershipRevenue) AS MembershipRevenue,
          SUM(DonationRevenue) AS DonationRevenue,
          SUM(
            TicketRevenue + GiftShopRevenue + CafeRevenue +
            MembershipRevenue + DonationRevenue
          ) AS Revenue,
          SUM(Visitors) AS TotalVisitors,
          MIN(SortDate) AS SortDate
        FROM (
          SELECT
            DATE_FORMAT(ticket.SaleDate, '%b %y') AS Month,
            SUM(ticket.Price) AS TicketRevenue,
            0 AS GiftShopRevenue,
            0 AS CafeRevenue,
            0 AS MembershipRevenue,
            0 AS DonationRevenue,
            COUNT(ticket.TicketID) AS Visitors,
            MIN(ticket.SaleDate) AS SortDate
          FROM ticket
          JOIN exhibition ON exhibition.ExhibitionID = ticket.ExhibitionID
          WHERE ticket.IsDeleted = 0
            AND ticket.RefundStatus <> 'Refunded'
            AND exhibition.IsDeleted = 0
            AND exhibition.CancelledAt IS NULL` +
      ticketDates +
      `
          GROUP BY DATE_FORMAT(ticket.SaleDate, '%b %y')

          UNION ALL

          SELECT
            DATE_FORMAT(sale.SaleDate, '%b %y') AS Month,
            0 AS TicketRevenue,
            SUM(sale.SalePrice * sale.Quantity) AS GiftShopRevenue,
            0 AS CafeRevenue,
            0 AS MembershipRevenue,
            0 AS DonationRevenue,
            0 AS Visitors,
            MIN(sale.SaleDate) AS SortDate
          FROM giftshopsale sale
          JOIN giftshop item ON item.ItemID = sale.ItemID
          WHERE sale.IsDeleted = 0 AND item.IsDeleted = 0` +
      giftDates +
      `
          GROUP BY DATE_FORMAT(sale.SaleDate, '%b %y')

          UNION ALL

          SELECT
            DATE_FORMAT(sale.SaleDate, '%b %y') AS Month,
            0 AS TicketRevenue,
            0 AS GiftShopRevenue,
            SUM(sale.SalePrice * sale.Quantity) AS CafeRevenue,
            0 AS MembershipRevenue,
            0 AS DonationRevenue,
            0 AS Visitors,
            MIN(sale.SaleDate) AS SortDate
          FROM cafesale sale
          JOIN cafe item ON item.ItemID = sale.ItemID
          WHERE sale.IsDeleted = 0 AND item.IsDeleted = 0` +
      cafeDates +
      `
          GROUP BY DATE_FORMAT(sale.SaleDate, '%b %y')

          UNION ALL

          SELECT
            DATE_FORMAT(term.StartDate, '%b %y') AS Month,
            0 AS TicketRevenue,
            0 AS GiftShopRevenue,
            0 AS CafeRevenue,
            SUM(term.Price) AS MembershipRevenue,
            0 AS DonationRevenue,
            0 AS Visitors,
            MIN(term.StartDate) AS SortDate
          FROM membershipterm term
          JOIN membership ON membership.MembershipID = term.MembershipID
          WHERE membership.IsDeleted = 0 AND term.CancelledAt IS NULL` +
      memberDates +
      `
          GROUP BY DATE_FORMAT(term.StartDate, '%b %y')

          UNION ALL

          SELECT
            DATE_FORMAT(DonationDate, '%b %y') AS Month,
            0 AS TicketRevenue,
            0 AS GiftShopRevenue,
            0 AS CafeRevenue,
            0 AS MembershipRevenue,
            SUM(AmountDonated) AS DonationRevenue,
            0 AS Visitors,
            MIN(DonationDate) AS SortDate
          FROM donations
          WHERE IsDeleted = 0` +
      donationDates +
      `
          GROUP BY DATE_FORMAT(DonationDate, '%b %y')
        ) combined
        GROUP BY Month
      ) monthly
    ) ranked
    ORDER BY SortDate ASC`,
    values
  );

  const summary = rows.map(function (row) {
    return {
      Month: row.Month,
      TicketRevenue: Number(row.TicketRevenue),
      GiftShopRevenue: Number(row.GiftShopRevenue),
      CafeRevenue: Number(row.CafeRevenue),
      MembershipRevenue: Number(row.MembershipRevenue),
      DonationRevenue: Number(row.DonationRevenue),
      Revenue: Number(row.Revenue),
      TotalVisitors: Number(row.TotalVisitors),
      AvgSpendPerVisitor: Number(row.AvgSpendPerVisitor),
      MonthOverMonthGrowth: Number(row.MonthOverMonthGrowth),
    };
  });

  const ticketValues = [];
  const giftValues = [];
  const cafeValues = [];
  const memberValues = [];
  const donationValues = [];
  const ticketTxnDates = dateFilter("ticket.SaleDate", dates, ticketValues);
  const giftTxnDates = dateFilter("sale.SaleDate", dates, giftValues);
  const cafeTxnDates = dateFilter("sale.SaleDate", dates, cafeValues);
  const memberTxnDates = dateFilter("term.StartDate", dates, memberValues);
  const donationTxnDates = dateFilter("DonationDate", dates, donationValues);

  const [ticketTxns] = await pool.query(
    `SELECT
      ticket.TicketID AS TransactionID,
      DATE_FORMAT(ticket.SaleDate, '%Y-%m-%d') AS TransactionDate,
      CONCAT(exhibition.Name, ' - ', ticket.TicketType) AS Detail,
      1 AS Quantity,
      ticket.Price AS Amount,
      COALESCE(ticket.PaymentMethod, 'Not recorded') AS PaymentMethod,
      TRIM(CONCAT(COALESCE(buyer.FirstName, ''), ' ', COALESCE(buyer.LastName, ''))) AS CustomerName,
      COALESCE(CONCAT(seller.FirstName, ' ', seller.LastName), 'Online') AS StaffName
    FROM ticket
    JOIN exhibition ON exhibition.ExhibitionID = ticket.ExhibitionID
    LEFT JOIN customer buyer ON buyer.CustomerID = ticket.CustomerID
    LEFT JOIN staff seller ON seller.StaffID = ticket.CreatedBy
    WHERE ticket.IsDeleted = 0
      AND ticket.RefundStatus <> 'Refunded'
      AND exhibition.IsDeleted = 0
      AND exhibition.CancelledAt IS NULL` +
      ticketTxnDates +
      `
    ORDER BY ticket.SaleDate DESC, ticket.TicketID DESC`,
    ticketValues
  );

  const [giftTxns] = await pool.query(
    `SELECT
      sale.SaleID AS TransactionID,
      DATE_FORMAT(sale.SaleDate, '%Y-%m-%d') AS TransactionDate,
      item.ItemName AS Detail,
      sale.Quantity AS Quantity,
      sale.SalePrice * sale.Quantity AS Amount,
      sale.PaymentMethod AS PaymentMethod,
      TRIM(CONCAT(COALESCE(buyer.FirstName, ''), ' ', COALESCE(buyer.LastName, ''))) AS CustomerName,
      CONCAT(staff.FirstName, ' ', staff.LastName) AS StaffName
    FROM giftshopsale sale
    JOIN giftshop item ON item.ItemID = sale.ItemID
    JOIN staff ON staff.StaffID = sale.StaffID
    LEFT JOIN membership member ON member.MembershipID = sale.MembershipID
    LEFT JOIN customer buyer
      ON buyer.CustomerID = COALESCE(sale.CustomerID, member.CustomerID)
    WHERE sale.IsDeleted = 0
      AND item.IsDeleted = 0` +
      giftTxnDates +
      `
    ORDER BY sale.SaleDate DESC, sale.SaleID DESC`,
    giftValues
  );

  const [cafeTxns] = await pool.query(
    `SELECT
      sale.SaleID AS TransactionID,
      DATE_FORMAT(sale.SaleDate, '%Y-%m-%d') AS TransactionDate,
      item.ItemName AS Detail,
      sale.Quantity AS Quantity,
      sale.SalePrice * sale.Quantity AS Amount,
      sale.PaymentMethod AS PaymentMethod,
      TRIM(CONCAT(COALESCE(buyer.FirstName, ''), ' ', COALESCE(buyer.LastName, ''))) AS CustomerName,
      CONCAT(staff.FirstName, ' ', staff.LastName) AS StaffName
    FROM cafesale sale
    JOIN cafe item ON item.ItemID = sale.ItemID
    JOIN staff ON staff.StaffID = sale.StaffID
    LEFT JOIN membership member ON member.MembershipID = sale.MembershipID
    LEFT JOIN customer buyer ON buyer.CustomerID = member.CustomerID
    WHERE sale.IsDeleted = 0
      AND item.IsDeleted = 0` +
      cafeTxnDates +
      `
    ORDER BY sale.SaleDate DESC, sale.SaleID DESC`,
    cafeValues
  );

  const [memberTxns] = await pool.query(
    `SELECT
      term.TermID AS TransactionID,
      DATE_FORMAT(term.StartDate, '%Y-%m-%d') AS TransactionDate,
      CONCAT(term.MembershipType, ' membership') AS Detail,
      1 AS Quantity,
      term.Price AS Amount,
      term.PaymentMethod AS PaymentMethod,
      TRIM(CONCAT(COALESCE(customer.FirstName, ''), ' ', COALESCE(customer.LastName, ''))) AS CustomerName,
      COALESCE(CONCAT(seller.FirstName, ' ', seller.LastName), 'Online') AS StaffName
    FROM membershipterm term
    JOIN membership ON membership.MembershipID = term.MembershipID
    LEFT JOIN customer ON customer.CustomerID = membership.CustomerID
    LEFT JOIN staff seller ON seller.StaffID = term.CreatedBy
    WHERE membership.IsDeleted = 0
      AND term.CancelledAt IS NULL` +
      memberTxnDates +
      `
    ORDER BY term.StartDate DESC, term.TermID DESC`,
    memberValues
  );

  const [donationTxns] = await pool.query(
    `SELECT
      donations.DonationID AS TransactionID,
      DATE_FORMAT(donations.DonationDate, '%Y-%m-%d') AS TransactionDate,
      'Donation' AS Detail,
      1 AS Quantity,
      donations.AmountDonated AS Amount,
      donations.PaymentMethod AS PaymentMethod,
      TRIM(CONCAT(donations.FirstName, ' ', donations.LastName)) AS CustomerName,
      COALESCE(CONCAT(seller.FirstName, ' ', seller.LastName), 'Online') AS StaffName
    FROM donations
    LEFT JOIN staff seller ON seller.StaffID = donations.CreatedBy
    WHERE donations.IsDeleted = 0` +
      donationTxnDates +
      `
    ORDER BY donations.DonationDate DESC, donations.DonationID DESC`,
    donationValues
  );

  function mapRevenueTxn(row) {
    return {
      TransactionID: Number(row.TransactionID),
      TransactionDate: row.TransactionDate,
      Detail: row.Detail,
      Quantity: Number(row.Quantity),
      Amount: Number(row.Amount),
      PaymentMethod: row.PaymentMethod || "-",
      CustomerName:
        row.CustomerName && row.CustomerName.trim() !== ""
          ? row.CustomerName
          : "Walk-in",
      StaffName: row.StaffName && row.StaffName.trim() !== ""
        ? row.StaffName
        : "-",
    };
  }

  return {
    status: 200,
    data: {
      summary: summary,
      transactions: {
        Tickets: ticketTxns.map(mapRevenueTxn),
        Gift: giftTxns.map(mapRevenueTxn),
        Café: cafeTxns.map(mapRevenueTxn),
        Members: memberTxns.map(mapRevenueTxn),
        Donations: donationTxns.map(mapRevenueTxn),
      },
    },
  };
}

async function getTicketSalesReport(params) {
  const dates = readDates(params);
  const values = [];
  const ticketDates = dateFilter("ticket.SaleDate", dates, values);

  const [rows] = await pool.query(
    `SELECT
      exhibition.ExhibitionID,
      exhibition.Name,
      exhibition.Capacity,
      COUNT(ticket.TicketID) AS TicketsSold,
      COALESCE(SUM(ticket.Price), 0) AS Revenue,
      SUM(CASE WHEN ticket.TicketType = 'Adult' THEN 1 ELSE 0 END) AS AdultTickets,
      COALESCE(SUM(CASE WHEN ticket.TicketType = 'Adult' THEN ticket.Price ELSE 0 END), 0) AS AdultRevenue,
      SUM(CASE WHEN ticket.TicketType = 'Senior' THEN 1 ELSE 0 END) AS SeniorTickets,
      COALESCE(SUM(CASE WHEN ticket.TicketType = 'Senior' THEN ticket.Price ELSE 0 END), 0) AS SeniorRevenue,
      SUM(CASE WHEN ticket.TicketType = 'Student' THEN 1 ELSE 0 END) AS StudentTickets,
      COALESCE(SUM(CASE WHEN ticket.TicketType = 'Student' THEN ticket.Price ELSE 0 END), 0) AS StudentRevenue,
      SUM(CASE WHEN ticket.TicketType = 'Child' THEN 1 ELSE 0 END) AS ChildTickets,
      COALESCE(SUM(CASE WHEN ticket.TicketType = 'Child' THEN ticket.Price ELSE 0 END), 0) AS ChildRevenue,
      GREATEST(exhibition.Capacity - COUNT(ticket.TicketID), 0) AS SeatsLeft,
      CASE
        WHEN exhibition.Capacity > 0
          THEN ROUND((COUNT(ticket.TicketID) / exhibition.Capacity) * 100, 1)
        ELSE 0
      END AS PercentFull,
      CASE
        WHEN COUNT(ticket.TicketID) > 0
          THEN ROUND(COALESCE(SUM(ticket.Price), 0) / COUNT(ticket.TicketID), 2)
        ELSE 0
      END AS AvgTicketPrice
    FROM exhibition
    LEFT JOIN ticket
      ON ticket.ExhibitionID = exhibition.ExhibitionID
      AND ticket.IsDeleted = 0
      AND ticket.RefundStatus <> 'Refunded'` +
      ticketDates +
      `
    WHERE exhibition.IsDeleted = 0
      AND exhibition.CancelledAt IS NULL
    GROUP BY exhibition.ExhibitionID, exhibition.Name, exhibition.Capacity
    ORDER BY TicketsSold DESC, exhibition.Name`,
    values
  );

  const summary = rows.map(function (row) {
    return {
      ExhibitionID: Number(row.ExhibitionID),
      Name: row.Name,
      Capacity: Number(row.Capacity),
      TicketsSold: Number(row.TicketsSold),
      Revenue: Number(row.Revenue),
      AdultTickets: Number(row.AdultTickets),
      AdultRevenue: Number(row.AdultRevenue),
      SeniorTickets: Number(row.SeniorTickets),
      SeniorRevenue: Number(row.SeniorRevenue),
      StudentTickets: Number(row.StudentTickets),
      StudentRevenue: Number(row.StudentRevenue),
      ChildTickets: Number(row.ChildTickets),
      ChildRevenue: Number(row.ChildRevenue),
      SeatsLeft: Number(row.SeatsLeft),
      PercentFull: Number(row.PercentFull),
      AvgTicketPrice: Number(row.AvgTicketPrice),
    };
  });

  const txnValues = [];
  const txnDates = dateFilter("ticket.SaleDate", dates, txnValues);

  const [txnRows] = await pool.query(
    `SELECT
      ticket.TicketID,
      exhibition.Name AS ExhibitionName,
      ticket.TicketType,
      ticket.Price,
      DATE_FORMAT(ticket.SaleDate, '%Y-%m-%d') AS SaleDate,
      buyer.FirstName,
      buyer.LastName,
      buyer.Phone,
      buyer.Email
    FROM ticket
    JOIN exhibition ON exhibition.ExhibitionID = ticket.ExhibitionID
    LEFT JOIN customer buyer ON buyer.CustomerID = ticket.CustomerID
    WHERE ticket.IsDeleted = 0
      AND ticket.RefundStatus <> 'Refunded'
      AND exhibition.IsDeleted = 0
      AND exhibition.CancelledAt IS NULL` +
      txnDates +
      `
    ORDER BY ticket.SaleDate DESC, ticket.TicketID DESC`,
    txnValues
  );

  const transactions = txnRows.map(function (row) {
    return {
      TicketID: Number(row.TicketID),
      ExhibitionName: row.ExhibitionName,
      TicketType: row.TicketType,
      Price: Number(row.Price),
      SaleDate: row.SaleDate,
      FirstName: row.FirstName || "",
      LastName: row.LastName || "",
      Phone: row.Phone || "",
      Email: row.Email || "",
    };
  });

  return {
    status: 200,
    data: {
      summary: summary,
      transactions: transactions,
    },
  };
}

async function getItemRevenue(params, saleTable, itemTable, storeName) {
  const dates = readDates(params);
  const values = [];
  const saleDates = dateFilter("sale.SaleDate", dates, values);

  const [rows] = await pool.query(
    `SELECT
      Store,
      ItemID,
      ItemName,
      Category,
      ListPrice,
      SaleCount,
      UnitsSold,
      Revenue,
      AvgSalePrice,
      CASE
        WHEN StoreTotal > 0 THEN ROUND((Revenue / StoreTotal) * 100, 1)
        ELSE 0
      END AS PercentOfTotal
    FROM (
      SELECT
        ? AS Store,
        item.ItemID,
        item.ItemName,
        item.Category,
        item.Price AS ListPrice,
        COUNT(sale.SaleID) AS SaleCount,
        COALESCE(SUM(sale.Quantity), 0) AS UnitsSold,
        COALESCE(SUM(sale.SalePrice * sale.Quantity), 0) AS Revenue,
        CASE
          WHEN COALESCE(SUM(sale.Quantity), 0) > 0
            THEN ROUND(
              COALESCE(SUM(sale.SalePrice * sale.Quantity), 0) /
              SUM(sale.Quantity),
              2
            )
          ELSE 0
        END AS AvgSalePrice,
        SUM(COALESCE(SUM(sale.SalePrice * sale.Quantity), 0)) OVER () AS StoreTotal
      FROM ` +
      saleTable +
      ` AS sale
      JOIN ` +
      itemTable +
      ` AS item ON item.ItemID = sale.ItemID
      WHERE sale.IsDeleted = 0 AND item.IsDeleted = 0` +
      saleDates +
      `
      GROUP BY item.ItemID, item.ItemName, item.Category, item.Price
    ) priced
    ORDER BY Revenue DESC, ItemName`,
    [storeName].concat(values)
  );

  return rows.map(function (row) {
    return {
      Store: row.Store,
      ItemID: Number(row.ItemID),
      ItemName: row.ItemName,
      Category: row.Category,
      ListPrice: Number(row.ListPrice),
      SaleCount: Number(row.SaleCount),
      UnitsSold: Number(row.UnitsSold),
      Revenue: Number(row.Revenue),
      AvgSalePrice: Number(row.AvgSalePrice),
      PercentOfTotal: Number(row.PercentOfTotal),
    };
  });
}

async function getStoreSaleTransactions(params, saleTable, itemTable, buyerExpr) {
  const dates = readDates(params);
  const values = [];
  const saleDates = dateFilter("sale.SaleDate", dates, values);

  const [rows] = await pool.query(
    `SELECT
      sale.SaleID,
      item.ItemName,
      sale.Quantity,
      sale.SalePrice * sale.Quantity AS Total,
      DATE_FORMAT(sale.SaleDate, '%Y-%m-%d') AS SaleDate,
      sale.PaymentMethod,
      CONCAT(buyer.FirstName, ' ', buyer.LastName) AS CustomerName,
      CONCAT(staff.FirstName, ' ', staff.LastName) AS StaffName
    FROM ` +
      saleTable +
      ` AS sale
    JOIN ` +
      itemTable +
      ` AS item ON item.ItemID = sale.ItemID
    JOIN staff ON staff.StaffID = sale.StaffID
    LEFT JOIN membership member ON member.MembershipID = sale.MembershipID
    LEFT JOIN customer buyer ON buyer.CustomerID = ` +
      buyerExpr +
      `
    WHERE sale.IsDeleted = 0
      AND item.IsDeleted = 0` +
      saleDates +
      `
    ORDER BY sale.SaleDate DESC, sale.SaleID DESC`,
    values
  );

  return rows.map(function (row) {
    return {
      SaleID: Number(row.SaleID),
      ItemName: row.ItemName,
      Quantity: Number(row.Quantity),
      Total: Number(row.Total),
      SaleDate: row.SaleDate,
      PaymentMethod: row.PaymentMethod,
      CustomerName: row.CustomerName && row.CustomerName.trim() !== ""
        ? row.CustomerName
        : "Walk-in",
      StaffName: row.StaffName,
    };
  });
}

async function getStoreItemsReport(params) {
  const giftShop = await getItemRevenue(
    params,
    "giftshopsale",
    "giftshop",
    "Gift Shop"
  );
  const cafe = await getItemRevenue(params, "cafesale", "cafe", "Café");
  const giftTxns = await getStoreSaleTransactions(
    params,
    "giftshopsale",
    "giftshop",
    "COALESCE(sale.CustomerID, member.CustomerID)"
  );
  const cafeTxns = await getStoreSaleTransactions(
    params,
    "cafesale",
    "cafe",
    "member.CustomerID"
  );

  return {
    status: 200,
    data: {
      summary: giftShop.concat(cafe),
      transactions: {
        "Gift Shop": giftTxns,
        Café: cafeTxns,
      },
    },
  };
}

async function getReportSummaryStats() {
  const [expiringRows] = await pool.query(
    `SELECT COUNT(term.MembershipID) AS ExpiringSoon
     FROM membershipterm term
     JOIN membership ON membership.MembershipID = term.MembershipID
     WHERE membership.IsDeleted = 0
       AND term.CancelledAt IS NULL
       AND term.EndDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
  );

  const [exhibRows] = await pool.query(
    `SELECT COALESCE(
        AVG(
          (
            SELECT COUNT(t.TicketID)
            FROM ticket t
            WHERE t.ExhibitionID = exhibition.ExhibitionID
              AND t.IsDeleted = 0
              AND t.RefundStatus <> 'Refunded'
          ) / NULLIF(exhibition.Capacity, 0) * 100
        ),
        0
      ) AS AvgCapacity
     FROM exhibition
     WHERE exhibition.IsDeleted = 0
       AND exhibition.CancelledAt IS NULL
       AND exhibition.Capacity > 0`
  );

  const [artRows] = await pool.query(
    `SELECT COUNT(ArtworkID) AS TotalArtworks
     FROM artwork
     WHERE IsDeleted = 0`
  );

  const [memberRows] = await pool.query(
    `SELECT COUNT(DISTINCT term.MembershipID) AS ActiveMembers
     FROM membershipterm term
     JOIN membership ON membership.MembershipID = term.MembershipID
     WHERE membership.IsDeleted = 0
       AND term.CancelledAt IS NULL
       AND term.StartDate <= CURDATE()
       AND term.EndDate >= CURDATE()`
  );

  return {
    status: 200,
    data: {
      expiringSoon: Number(expiringRows[0].ExpiringSoon || 0),
      avgCapacity: Math.round(Number(exhibRows[0].AvgCapacity || 0)),
      totalArtworks: Number(artRows[0].TotalArtworks || 0),
      activeMembers: Number(memberRows[0].ActiveMembers || 0),
    },
  };
}


module.exports = [
  { method: "GET", path: "/api/reports/revenue", handler: getRevenueReport },
  {
    method: "GET",
    path: "/api/reports/ticket-sales",
    handler: getTicketSalesReport,
  },
  {
    method: "GET",
    path: "/api/reports/giftshop-cafe",
    handler: getStoreItemsReport,
  },
  {
    method: "GET",
    path: "/api/reports/summary-stats",
    handler: getReportSummaryStats,
  },
];