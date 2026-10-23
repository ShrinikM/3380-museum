const pool = require("../db");
const { ticketPrices, ticketTypes } = require("../prices");

const selectTickets = `
  SELECT
    t.TicketID,
    t.TicketType,
    t.Price,
    DATE_FORMAT(t.SaleDate, '%Y-%m-%d') AS SaleDate,
    t.ExhibitionID,
    e.Name AS ExhibitionName,
    t.MembershipID,
    m.DiscountPercent AS MemberDiscount,
    CASE
      WHEN m.MembershipID IS NOT NULL
      THEN CONCAT(m.FirstName, ' ', m.LastName)
      ELSE NULL
    END AS MembershipName
  FROM ticket t
  JOIN exhibition e
    ON e.ExhibitionID = t.ExhibitionID
  LEFT JOIN membership m
    ON m.MembershipID = t.MembershipID
  WHERE t.IsDeleted = 0
`;

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


function checkTicket(body) {
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

  if (
    typeof body.SaleDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.SaleDate)
  ) {
    throw makeError(400, "SaleDate must use YYYY-MM-DD format");
  }

  const date = new Date(body.SaleDate + "T00:00:00.000Z");

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== body.SaleDate
  ) {
    throw makeError(400, "SaleDate must be a valid date");
  }

  const today = new Date().toISOString().slice(0, 10);

  if (body.SaleDate > today) {
    throw makeError(400, "SaleDate cannot be in the future");
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
    MembershipID: membershipID,
  };
}



async function checkReferences(ticket) {
  const [exhibitions] = await pool.query(
    `SELECT ExhibitionID
     FROM exhibition
     WHERE ExhibitionID = ? AND IsDeleted = 0`,
    [ticket.ExhibitionID]
  );

  if (exhibitions.length === 0) {
    throw makeError(400, "The selected exhibition does not exist");
  }

  if (ticket.MembershipID !== null) {
    const [memberships] = await pool.query(
      `SELECT MembershipID, DiscountPercent
       FROM membership
       WHERE MembershipID = ?
         AND IsDeleted = 0
         AND StartDate <= CURDATE()
         AND EndDate >= CURDATE()`,
      [ticket.MembershipID]
    );

    if (memberships.length === 0) {
      throw makeError(
        400,
        "The selected membership is not active or does not exist"
      );
    }

    const discount = Number(memberships[0].DiscountPercent);

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
      MemberDiscount: ticket.MemberDiscount === null
        ? null
        : Number(ticket.MemberDiscount),
    })),
  };
}

async function addTicket(params, body) {
  const ticket = checkTicket(body);

  await checkReferences(ticket);

  const [result] = await pool.query(
    `INSERT INTO ticket
      (TicketType, Price, SaleDate, ExhibitionID, MembershipID,
       CreatedAt, UpdatedAt, CreatedBy, IsDeleted)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL, 0)`,
    [
      ticket.TicketType,
      ticket.Price,
      ticket.SaleDate,
      ticket.ExhibitionID,
      ticket.MembershipID,
    ]
  );

  return {
    status: 201,
    data: await findTicket(result.insertId),
  };
}

async function updateTicket(params, body) {
  const id = checkId(params);
  const ticket = checkTicket(body);

  if (await findTicket(id) === null) {
    throw makeError(404, "Ticket not found");
  }

  await checkReferences(ticket);

  await pool.query(
    `UPDATE ticket
     SET TicketType = ?,
         Price = ?,
         SaleDate = ?,
         ExhibitionID = ?,
         MembershipID = ?,
         UpdatedAt = NOW()
     WHERE TicketID = ? AND IsDeleted = 0`,
    [
      ticket.TicketType,
      ticket.Price,
      ticket.SaleDate,
      ticket.ExhibitionID,
      ticket.MembershipID,
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

module.exports = [
  {
    method: "GET",
    path: "/api/tickets",
    handler: getTickets,
  },
  {
    method: "POST",
    path: "/api/tickets",
    handler: addTicket,
  },
  {
    method: "PUT",
    path: "/api/tickets/:id",
    handler: updateTicket,
  },
  {
    method: "DELETE",
    path: "/api/tickets/:id",
    handler: deleteTicket,
  },
];