const pool = require("./db");

const membershipPlans = {
  Dual: {
    Price: 75,
    DiscountPercent: 25,
    GiftShopDiscount: 15,
    CafeDiscount: 15,
  },
  Family: {
    Price: 150,
    DiscountPercent: 25,
    GiftShopDiscount: 15,
    CafeDiscount: 15,
  },
  Student: {
    Price: 40,
    DiscountPercent: 35,
    GiftShopDiscount: 20,
    CafeDiscount: 20,
  },
  Senior: {
    Price: 60,
    DiscountPercent: 30,
    GiftShopDiscount: 20,
    CafeDiscount: 20,
  },
};

// How many tickets of each type get the membership discount.
const membershipTicketLimits = {
  Dual: { Adult: 2 },
  Family: { Adult: 2, Child: 2 },
  Student: { Adult: 2 },
  Senior: { Senior: 20 },
};

const membershipTypes = Object.keys(membershipPlans);

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
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

function getMembershipLimits(membershipType) {
  return membershipTicketLimits[membershipType] || {};
}

function getMembershipTicketDiscount(membershipType, discountPercent, ticketType) {
  const limits = getMembershipLimits(membershipType);

  if (!limits[ticketType]) {
    return 0;
  }

  return Number(discountPercent) || 0;
}

module.exports = {
  getTicketPrices,
  getTicketTypes,
  membershipPlans,
  membershipTicketLimits,
  membershipTypes,
  getMembershipLimits,
  getMembershipTicketDiscount,
};
