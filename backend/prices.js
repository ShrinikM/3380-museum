const ticketPrices = {
  Adult: 25,
  Senior: 20,
  Student: 15,
  Child: 15,
};

const ticketTypes = Object.keys(ticketPrices);

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

const membershipTicketLimits = {
  Dual: { Adult: 2 },
  Family: { Adult: 2, Child: 2 },
  Student: { Adult: 2 },
  Senior: { Adult: 2 },
};

const membershipTypes = Object.keys(membershipPlans);

module.exports = {
  ticketPrices,
  ticketTypes,
  membershipPlans,
  membershipTicketLimits,
  membershipTypes,
};
