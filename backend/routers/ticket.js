const pool = require("../db");
const {
  getTicketPrices,
  getTicketTypes,
  getMembershipTicketDiscount,
  getMembershipLimits,
  countMemberDiscounts,
  countReservedSeats,
} = require("../prices");
const { joinCurrentTerm, activeTerm } = require("../terms");

const selectTickets = `
  SELECT
    t.TicketID,
    t.TicketType,
    t.Price,
    t.PaymentMethod,
    DATE_FORMAT(t.SaleDate, '%Y-%m-%d') AS SaleDate,
    DATE_FORMAT(t.VisitDate, '%Y-%m-%d') AS VisitDate,
    t.ExhibitionID,
    e.Name AS ExhibitionName,
    t.MembershipID,
    t.CustomerID,
    t.RefundStatus,
    t.NotificationStatus,
    term.MembershipType,
    term.DiscountPercent AS MemberDiscount,
    CONCAT(member.FirstName, ' ', member.LastName) AS MembershipName,
    CONCAT(buyer.FirstName, ' ', buyer.LastName) AS CustomerName,
    buyer.Email AS CustomerEmail
  FROM ticket t
  JOIN exhibition e
    ON e.ExhibitionID = t.ExhibitionID
  LEFT JOIN membership m
    ON m.MembershipID = t.MembershipID
  LEFT JOIN customer member
    ON member.CustomerID = m.CustomerID
  LEFT JOIN customer buyer
    ON buyer.CustomerID = t.CustomerID
  ${joinCurrentTerm("m", "LEFT JOIN")}
  WHERE t.IsDeleted = 0
`;

const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Mobile Pay"];

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00.000Z");

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function checkId(params) {
  const id = Number(params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw makeError(400, "Ticket id must be a positive integer");
  }

  return id;
}


function checkTicket(body, ticketPrices) {
  const ticketTypes = getTicketTypes(ticketPrices);

  if (!ticketTypes.includes(body.TicketType)) {
    throw makeError(400, "Please select a valid ticket type");
  }

  const exhibitionID = Number(body.ExhibitionID);

  if (
    body.ExhibitionID === "" ||
    body.ExhibitionID === null ||
    body.ExhibitionID === undefined ||
    !Number.isSafeInteger(exhibitionID) ||
    exhibitionID < 1
  ) {
    throw makeError(400, "Please select a valid exhibition");
  }

  if (!isRealDate(body.SaleDate)) {
    throw makeError(400, "Please select a valid sale date");
  }

  const today = new Date().toISOString().slice(0, 10);

  if (body.SaleDate > today) {
    throw makeError(400, "Sale date cannot be in the future");
  }

  if (!isRealDate(body.VisitDate)) {
    throw makeError(400, "Please select a valid visit date");
  }

  if (body.VisitDate < body.SaleDate) {
    throw makeError(400, "Visit date cannot be before the sale date");
  }

  if (!paymentMethods.includes(body.PaymentMethod)) {
    throw makeError(400, "Please select a payment method");
  }

  let membershipID = null;

  if (
    body.MembershipID !== "" &&
    body.MembershipID !== null &&
    body.MembershipID !== undefined
  ) {
    membershipID = Number(body.MembershipID);

    if (!Number.isSafeInteger(membershipID) || membershipID < 1) {
      throw makeError(400, "Please select a valid membership");
    }
  }

  return {
    ExhibitionID: exhibitionID,
    TicketType: body.TicketType,
    Price: ticketPrices[body.TicketType],
    SaleDate: body.SaleDate,
    VisitDate: body.VisitDate,
    PaymentMethod: body.PaymentMethod,
    MembershipID: membershipID,
    CustomerID: null,
  };
}



async function checkReferences(ticket, ticketPrices, skipTicketId = null) {
  const [exhibitions] = await pool.query(
    `SELECT
       ExhibitionID,
       DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate
     FROM exhibition
     WHERE ExhibitionID = ? AND IsDeleted = 0`,
    [ticket.ExhibitionID]
  );

  if (exhibitions.length === 0) {
    throw makeError(400, "The selected exhibition does not exist");
  }

  if (
    ticket.VisitDate < exhibitions[0].StartDate ||
    ticket.VisitDate > exhibitions[0].EndDate
  ) {
    throw makeError(400, "Visit date must be within the exhibition dates");
  }

  if (ticket.MembershipID !== null) {
    const [memberships] = await pool.query(
      `SELECT
         m.MembershipID,
         m.CustomerID,
         term.MembershipType,
         term.DiscountPercent
       FROM membership m
       ${joinCurrentTerm("m")}
       WHERE m.MembershipID = ?
         AND m.IsDeleted = 0
         AND ${activeTerm}`,
      [ticket.MembershipID]
    );

    if (memberships.length === 0) {
      throw makeError(
        400,
        "The selected membership is not active or does not exist"
      );
    }

    const membership = memberships[0];

    if (
      ticket.TicketType === "Student" &&
      membership.MembershipType === "Senior"
    ) {
      throw makeError(
        400,
        "Student tickets are not available with a Senior membership."
      );
    }

    let discount = getMembershipTicketDiscount(
      membership.MembershipType,
      membership.DiscountPercent,
      ticket.TicketType
    );

    const used = await countMemberDiscounts(
      pool,
      ticket.MembershipID,
      ticket.VisitDate,
      ticketPrices,
      skipTicketId
    );
    const limit = getMembershipLimits(membership.MembershipType)[ticket.TicketType] || 0;

    if (used[ticket.TicketType] >= limit) {
      discount = 0;
    }

    ticket.CustomerID = Number(membership.CustomerID);

    ticket.Price = Number(
      (ticket.Price * (1 - discount / 100)).toFixed(2)
    );
  }
}


async function findTicket(id) {
  const [rows] = await pool.query(
    selectTickets + " AND t.TicketID = ?",
    [id]
  );

  return rows.length === 0 ? null : rows[0];
}

async function getTickets() {
  const [rows] = await pool.query(
    selectTickets + " ORDER BY t.SaleDate DESC, t.TicketID DESC"
  );

  return {
    status: 200,
    data: rows.map((ticket) => ({
      ...ticket,
      Price: Number(ticket.Price),
      ExhibitionID: Number(ticket.ExhibitionID),
      MembershipID: ticket.MembershipID === null
        ? null
        : Number(ticket.MembershipID),
      CustomerID: ticket.CustomerID === null
        ? null
        : Number(ticket.CustomerID),
      MemberDiscount: ticket.MemberDiscount === null
        ? null
        : Number(ticket.MemberDiscount),
    })),
  };
}

async function getPrices() {
  const prices = await getTicketPrices();

  return {
    status: 200,
    data: prices,
  };
}

async function addTicket(params, body, staffId) {
  const ticketPrices = await getTicketPrices();
  const ticket = checkTicket(body, ticketPrices);

  await checkReferences(ticket, ticketPrices);

  const [capacity] = await pool.query(
    `SELECT
       e.Capacity - (
         SELECT COUNT(*) FROM ticket t
         WHERE t.ExhibitionID = e.ExhibitionID
           AND t.IsDeleted = 0
           AND t.RefundStatus <> 'Refunded'
       ) AS Open
     FROM exhibition e
     WHERE e.ExhibitionID = ?`,
    [ticket.ExhibitionID]
  );
  const reserved = await countReservedSeats(pool, ticket.ExhibitionID, ticket.CustomerID);

  if (Number(capacity[0].Open) - reserved <= 0) {
    throw makeError(400, "No seats left. Remaining seats are held for the waitlist.");
  }

  const [result] = await pool.query(
    `INSERT INTO ticket
      (TicketType, Price, PaymentMethod, SaleDate, VisitDate, ExhibitionID,
       MembershipID, CustomerID, CreatedAt, UpdatedAt, CreatedBy, IsDeleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, 0)`,
    [
      ticket.TicketType,
      ticket.Price,
      ticket.PaymentMethod,
      ticket.SaleDate,
      ticket.VisitDate,
      ticket.ExhibitionID,
      ticket.MembershipID,
      ticket.CustomerID,
      staffId,
    ]
  );

  return {
    status: 201,
    data: await findTicket(result.insertId),
  };
}

async function updateTicket(params, body) {
  const id = checkId(params);
  const ticketPrices = await getTicketPrices();
  const ticket = checkTicket(body, ticketPrices);

  if (await findTicket(id) === null) {
    throw makeError(404, "Ticket not found");
  }

  await checkReferences(ticket, ticketPrices, id);

  await pool.query(
    `UPDATE ticket
     SET TicketType = ?,
         Price = ?,
         PaymentMethod = ?,
         SaleDate = ?,
         VisitDate = ?,
         ExhibitionID = ?,
         MembershipID = ?,
         CustomerID = COALESCE(?, CustomerID),
         UpdatedAt = NOW()
     WHERE TicketID = ? AND IsDeleted = 0`,
    [
      ticket.TicketType,
      ticket.Price,
      ticket.PaymentMethod,
      ticket.SaleDate,
      ticket.VisitDate,
      ticket.ExhibitionID,
      ticket.MembershipID,
      ticket.CustomerID,
      id,
    ]
  );

  return {
    status: 200,
    data: await findTicket(id),
  };
}

async function deleteTicket(params) {
  const id = checkId(params);

  if (await findTicket(id) === null) {
    throw makeError(404, "Ticket not found");
  }

  await pool.query(
    `UPDATE ticket
     SET IsDeleted = 1, UpdatedAt = NOW()
     WHERE TicketID = ? AND IsDeleted = 0`,
    [id]
  );

  return {
    status: 200,
    data: { message: "Ticket deleted" },
  };
}

function checkExhibitionId(params) {
  const id = Number(params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw makeError(400, "Exhibition id must be a positive integer");
  }

  return id;
}

async function getRefunds() {
  const [rows] = await pool.query(
    `SELECT
       e.ExhibitionID,
       e.Name AS ExhibitionName,
       e.CancellationReason,
       DATE_FORMAT(e.CancelledAt, '%Y-%m-%d') AS CancelledAt,
       COUNT(t.TicketID) AS Tickets,
       SUM(t.NotificationStatus = 'Pending') AS PendingNotices,
       SUM(t.RefundStatus = 'Pending') AS PendingRefunds,
       COALESCE(SUM(CASE WHEN t.RefundStatus = 'Pending' THEN t.Price END), 0) AS RefundTotal
     FROM exhibition e
     JOIN ticket t
       ON t.ExhibitionID = e.ExhibitionID
      AND t.IsDeleted = 0
     WHERE e.IsDeleted = 0
       AND e.CancelledAt IS NOT NULL
     GROUP BY e.ExhibitionID, e.Name, e.CancellationReason, e.CancelledAt
     HAVING PendingNotices > 0 OR PendingRefunds > 0
     ORDER BY e.CancelledAt DESC, e.ExhibitionID DESC`
  );

  return {
    status: 200,
    data: rows.map((row) => ({
      ...row,
      ExhibitionID: Number(row.ExhibitionID),
      Tickets: Number(row.Tickets),
      PendingNotices: Number(row.PendingNotices),
      PendingRefunds: Number(row.PendingRefunds),
      RefundTotal: Number(row.RefundTotal),
    })),
  };
}

async function getWaitlists() {
  const [rows] = await pool.query(
    `SELECT
       e.ExhibitionID,
       e.Name AS ExhibitionName,
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

  return {
    status: 200,
    data: rows.map((row) => ({
      ...row,
      ExhibitionID: Number(row.ExhibitionID),
      Waiting: Number(row.Waiting),
      Notified: Number(row.Notified),
    })),
  };
}

async function sendNotices(params) {
  const id = checkExhibitionId(params);

  const [result] = await pool.query(
    `UPDATE ticket
     SET NotificationStatus = 'Sent', UpdatedAt = NOW()
     WHERE ExhibitionID = ?
       AND IsDeleted = 0
       AND NotificationStatus = 'Pending'`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw makeError(404, "No visitors are waiting to be notified");
  }

  return {
    status: 200,
    data: { message: "Visitors notified", count: result.affectedRows },
  };
}

async function refundTickets(params) {
  const id = checkExhibitionId(params);

  const [result] = await pool.query(
    `UPDATE ticket
     SET RefundStatus = 'Refunded', UpdatedAt = NOW()
     WHERE ExhibitionID = ?
       AND IsDeleted = 0
       AND RefundStatus = 'Pending'`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw makeError(404, "No tickets are waiting for a refund");
  }

  return {
    status: 200,
    data: { message: "Tickets refunded", count: result.affectedRows },
  };
}

module.exports = [
  {
    method: "GET",
    path: "/api/ticket-prices",
    handler: getPrices,
  },
  {
    method: "GET",
    path: "/api/tickets",
    handler: getTickets,
  },
  {
    method: "GET",
    path: "/api/tickets/refunds",
    handler: getRefunds,
  },
  {
    method: "GET",
    path: "/api/tickets/waitlist",
    handler: getWaitlists,
  },
  {
    method: "POST",
    path: "/api/tickets/exhibition/:id/notify",
    handler: sendNotices,
    needsActor: true,
  },
  {
    method: "POST",
    path: "/api/tickets/exhibition/:id/refund",
    handler: refundTickets,
    needsActor: true,
  },
  {
    method: "POST",
    path: "/api/tickets",
    handler: addTicket,
    needsActor: true,
  },
  {
    method: "PUT",
    path: "/api/tickets/:id",
    handler: updateTicket,
    needsActor: true,
  },
  {
    method: "DELETE",
    path: "/api/tickets/:id",
    handler: deleteTicket,
    needsActor: true,
  },
];