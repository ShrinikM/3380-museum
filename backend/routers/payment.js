const { getPaymentMethods } = require("../paymentMethods");

const usedForValues = [
  "ticket",
  "membership",
  "donation",
  "store",
  "online",
  "online_membership",
  "online_donation",
];

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function listPaymentMethods(params) {
  if (!usedForValues.includes(params.for)) {
    throw makeError(400, "Unknown payment method list");
  }

  const methods = await getPaymentMethods(params.for);
  return { status: 200, data: methods };
}

module.exports = [
  { method: "GET", path: "/api/payment-methods", handler: listPaymentMethods },
];