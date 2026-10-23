// Ticket prices used by both the staff Tickets page and the customer page.
const ticketPrices = {
  Adult: 25,
  Senior: 20,
  Student: 15,
  Child: 15,
};

const ticketTypes = Object.keys(ticketPrices);

module.exports = { ticketPrices, ticketTypes };