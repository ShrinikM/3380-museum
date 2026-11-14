const pool = require("./db");

const ticketLimitColumns = [
  ["Adult", "AdultTicketLimit"],
  ["Child", "ChildTicketLimit"],
  ["Student", "StudentTicketLimit"],
  ["Senior", "SeniorTicketLimit"],
];

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function ticketLimitsFromRow(row) {
  const limits = {};

  for (const [ticketType, column] of ticketLimitColumns) {
    const limit = Number(row[column]) || 0;

    if (limit > 0) {
      limits[ticketType] = limit;
    }
  }

  return limits;
}

async function getTicketPrices() {
  const [rows] = await pool.query(
    `SELECT TicketType, Price
     FROM ticketprice
     ORDER BY FIELD(TicketType, 'Adult', 'Senior', 'Student', 'Child')`
  );

  if (rows.length === 0) {
    throw makeError(
      500,
      "Ticket prices are not set up in the database. Run backend/schema/ticketprice.sql."
    );
  }

  const prices = {};

  for (const row of rows) {
    prices[row.TicketType] = Number(row.Price);
  }

  return prices;
}

function getTicketTypes(prices) {
  return Object.keys(prices);
}

async function getMembershipPlans() {
  const [rows] = await pool.query(
    `SELECT
       MembershipType,
       Price,
       DiscountPercent,
       GiftShopDiscount,
       CafeDiscount,
       AdultTicketLimit,
       ChildTicketLimit,
       StudentTicketLimit,
       SeniorTicketLimit
     FROM membershipprice
     ORDER BY FIELD(MembershipType, 'Dual', 'Family', 'Student', 'Senior')`
  );

  if (rows.length === 0) {
    throw makeError(
      500,
      "Membership prices are not set up in the database. Run backend/schema/membershipprice.sql."
    );
  }

  const plans = {};

  for (const row of rows) {
    plans[row.MembershipType] = {
      Price: Number(row.Price),
      DiscountPercent: Number(row.DiscountPercent),
      GiftShopDiscount: Number(row.GiftShopDiscount),
      CafeDiscount: Number(row.CafeDiscount),
      TicketLimits: ticketLimitsFromRow(row),
    };
  }

  return plans;
}

function getMembershipTypes(plans) {
  return Object.keys(plans);
}

function getMembershipLimits(plans, membershipType) {
  return plans[membershipType]?.TicketLimits || {};
}

function getMembershipTicketDiscount(
  plans,
  membershipType,
  discountPercent,
  ticketType
) {
  const limits = getMembershipLimits(plans, membershipType);

  if (!limits[ticketType]) {
    return 0;
  }

  return Number(discountPercent) || 0;
}

async function countMemberDiscounts(
  db,
  membershipId,
  visitDate,
  ticketPrices,
  skipTicketId = null,
  exhibitionId = null
) {
  const used = { Adult: 0, Child: 0, Student: 0, Senior: 0 };

  if (membershipId === null || !visitDate) {
    return used;
  }

  const [rows] = await db.query(
    `SELECT TicketType, Price
     FROM ticket
     WHERE MembershipID = ?
       AND VisitDate = ?
       AND (? IS NULL OR ExhibitionID = ?)
       AND IsDeleted = 0
       AND RefundStatus <> 'Refunded'
       AND NOT (TicketID <=> ?)`,
    [membershipId, visitDate, exhibitionId, exhibitionId, skipTicketId]
  );

  for (const row of rows) {
    if (Number(row.Price) < Number(ticketPrices[row.TicketType])) {
      used[row.TicketType] = (used[row.TicketType] || 0) + 1;
    }
  }

  return used;
}

async function countReservedSeats(db, exhibitionId, customerId = null) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS Total
     FROM waitlist
     WHERE ExhibitionID = ?
       AND Status = 'Notified'
       AND NOT (CustomerID <=> ?)`,
    [exhibitionId, customerId]
  );

  return Number(rows[0].Total);
}

module.exports = {
  countMemberDiscounts,
  countReservedSeats,
  getTicketPrices,
  getTicketTypes,
  getMembershipPlans,
  getMembershipTypes,
  getMembershipLimits,
  getMembershipTicketDiscount,
};
