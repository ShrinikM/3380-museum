const pool = require("../db");
const { getPaymentMethods } = require("../paymentMethods");


const selectDonations = `
  SELECT
    DonationID,
    FirstName,
    LastName,
    PaymentMethod,
    AmountDonated,
    DATE_FORMAT(DonationDate, '%Y-%m-%d') AS DonationDate,
    CreatedAt,
    UpdatedAt
  FROM donations
  WHERE IsDeleted = 0`;

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

function checkName(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw makeError(400, label + " is required");
  }
  if (value.trim().length > 100) {
    throw makeError(400, label + " must be 100 characters or fewer");
  }
  if (!namePattern.test(value.trim())) {
    throw makeError(400, label + " can only contain letters, spaces, hyphens, or apostrophes");
  }
  return value.trim();
}

function checkAmount(value) {
  const amount = Number(value);

  if (value === undefined || value === null || value === "" || !Number.isFinite(amount)) {
    throw makeError(400, "Please enter a donation amount");
  }
  if (amount <= 0) {
    throw makeError(400, "Amount must be greater than $0");
  }
  if (amount > 999999.99) {
    throw makeError(400, "Amount cannot be more than $999,999.99");
  }
  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    throw makeError(400, "Amount can have no more than two decimal places");
  }

  return amount;
}

function checkDate(value, fieldName) {
  if (typeof value !== "string") {
    throw makeError(400, "Please select a valid " + fieldName);
  }

  const date = new Date(value);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw makeError(400, "Please select a valid " + fieldName);
  }

  const today = new Date().toISOString().slice(0, 10);
  if (value > today) {
    throw makeError(400, "The " + fieldName + " cannot be in the future");
  }
  if (value < "1000-01-01") {
    throw makeError(400, "Please select a valid " + fieldName);
  }

  return value;
}

function checkDonation(body, paymentMethods) {
  const donation = {};

  donation.FirstName = checkName(body.FirstName, "First name");
  donation.LastName = checkName(body.LastName, "Last name");
  donation.AmountDonated = checkAmount(body.AmountDonated);

  donation.PaymentMethod = body.PaymentMethod;
  if (!paymentMethods.includes(donation.PaymentMethod)) {
    throw makeError(400, "Please select a payment method");
  }

  if (body.DonationDate === undefined || body.DonationDate === null || body.DonationDate === "") {
    throw makeError(400, "Donation date is required");
  }
  donation.DonationDate = checkDate(body.DonationDate, "donation date");

  return donation;
}

function checkId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw makeError(400, "Donation id must be a whole number greater than 0");
  }
  return id;
}

async function findDonation(id) {
  const [rows] = await pool.query(selectDonations + " AND DonationID = ?", [id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function getDonations(params, body, staffId) {
  const [rows] = await pool.query(selectDonations + " ORDER BY DonationDate DESC, DonationID DESC");
  return { status: 200, data: rows };
}

async function addDonation(params, body, staffId) {
  const paymentMethods = await getPaymentMethods("donation");
  const donation = checkDonation(body, paymentMethods);

  const [result] = await pool.query(
    `INSERT INTO donations
      (FirstName, LastName, PaymentMethod, AmountDonated, DonationDate, CreatedAt, UpdatedAt, CreatedBy)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
    [
      donation.FirstName,
      donation.LastName,
      donation.PaymentMethod,
      donation.AmountDonated,
      donation.DonationDate,
      staffId,
    ]
  );

  const newDonation = await findDonation(result.insertId);
  return { status: 201, data: newDonation };
}

async function updateDonation(params, body, staffId) {
  const id = checkId(params);
  const paymentMethods = await getPaymentMethods("donation");
  const donation = checkDonation(body, paymentMethods);

  const existingDonation = await findDonation(id);
  if (existingDonation === null) {
    throw makeError(404, "Donation not found");
  }

  await pool.query(
    `UPDATE donations
     SET FirstName = ?, LastName = ?, PaymentMethod = ?, AmountDonated = ?, DonationDate = ?, UpdatedAt = NOW()
     WHERE DonationID = ?`,
    [
      donation.FirstName,
      donation.LastName,
      donation.PaymentMethod,
      donation.AmountDonated,
      donation.DonationDate,
      id,
    ]
  );

  const updatedDonation = await findDonation(id);
  return { status: 200, data: updatedDonation };
}

async function deleteDonation(params, body, staffId) {
  const id = checkId(params);

  const existingDonation = await findDonation(id);
  if (existingDonation === null) {
    throw makeError(404, "Donation not found");
  }

  await pool.query("UPDATE donations SET IsDeleted = 1, UpdatedAt = NOW() WHERE DonationID = ?", [id]);

  return { status: 200, data: { message: "Donation deleted" } };
}

const minPublicDonation = 10;

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

async function addPublicDonation(params, body) {
  const onlinePaymentMethods = await getPaymentMethods("online_donation");

  if (!onlinePaymentMethods.includes(body.PaymentMethod)) {
    throw makeError(400, "Please choose a payment method");
  }

  const donation = checkDonation({
    ...body,
    DonationDate: localToday(),
  }, onlinePaymentMethods);

  if (donation.AmountDonated < minPublicDonation) {
    throw makeError(400, "The minimum donation is $10");
  }

  const [result] = await pool.query(
    `INSERT INTO donations
      (FirstName, LastName, PaymentMethod, AmountDonated, DonationDate, CreatedAt, UpdatedAt, CreatedBy)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL)`,
    [
      donation.FirstName,
      donation.LastName,
      donation.PaymentMethod,
      donation.AmountDonated,
      donation.DonationDate,
    ]
  );

  const newDonation = await findDonation(result.insertId);
  return { status: 201, data: newDonation };
}

module.exports = [
  { method: "GET", path: "/api/donations", handler: getDonations },
  { method: "POST", path: "/api/public/donations", handler: addPublicDonation },
  { method: "POST", path: "/api/donations", handler: addDonation, needsActor: true },
  { method: "PUT", path: "/api/donations/:id", handler: updateDonation, needsActor: true },
  { method: "DELETE", path: "/api/donations/:id", handler: deleteDonation, needsActor: true },
];