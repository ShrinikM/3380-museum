const ticketPrices = {
  Adult: 25,
  Senior: 20,
  Student: 15,
  Child: 15,
};

const ticketTypes = Object.keys(ticketPrices);

const membershipPlans = {
  Individual: { Price: 75, DiscountPercent: 5 },
  Family: { Price: 150, DiscountPercent: 10 },
  Student: { Price: 40, DiscountPercent: 10 },
  Senior: { Price: 60, DiscountPercent: 15 },
};

const membershipTypes = Object.keys(membershipPlans);

module.exports = { ticketPrices, ticketTypes, membershipPlans, membershipTypes };
