const pool = require("../db");

const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Check", "Bank Transfer"];

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

function checkText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw makeError(400, fieldName + " is required");
  }
  if (value.trim().length > 255) {
    throw makeError(400, fieldName + " must be 255 characters or fewer");
  }
  return value.trim();
}

function checkAmount(value) {
  const amount = Number(value);

  if (value === undefined || value === null || value === "" || !Number.isFinite(amount)) {
    throw makeError(400, "AmountDonated must be a number");
  }
  if (amount <= 0) {
    throw makeError(400, "AmountDonated must be greater than 0");
  }
  if (amount > 999999.99) {
    throw makeError(400, "AmountDonated cannot be more than 999999.99");
  }
  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    throw makeError(400, "AmountDonated can have no more than two decimal places");
  }

  return amount;
}

function checkDate(value, fieldName) {
  if (typeof value !== "string") {
    throw makeError(400, fieldName + " must be a date like 2026-01-31");
  }

  const date = new Date(value);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw makeError(400, fieldName + " must be a real date like 2026-01-31");
  }

  const today = new Date().toISOString().slice(0, 10);
  if (value > today) {
    throw makeError(400, fieldName + " cannot be in the future");
  }
  if (value < "1000-01-01") {
    throw makeError(400, fieldName + " cannot be before 1000-01-01");
  }

  return value;
}

function checkDonation(body) {
  const donation = {};

  donation.FirstName = checkText(body.FirstName, "FirstName");
  donation.LastName = checkText(body.LastName, "LastName");
  donation.AmountDonated = checkAmount(body.AmountDonated);

  donation.PaymentMethod = checkText(body.PaymentMethod, "PaymentMethod");
  if (!paymentMethods.includes(donation.PaymentMethod)) {
    throw makeError(400, "PaymentMethod must be Cash, Credit Card, Debit Card, Check or Bank Transfer");
  }

  if (body.DonationDate === undefined || body.DonationDate === null || body.DonationDate === "") {
    throw makeError(400, "DonationDate is required");
  }
  donation.DonationDate = checkDate(body.DonationDate, "DonationDate");

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
  const donation = checkDonation(body);

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
  const donation = checkDonation(body);

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

module.exports = [
  { method: "GET", path: "/api/donations", handler: getDonations },
  { method: "POST", path: "/api/donations", handler: addDonation, needsActor: true },
  { method: "PUT", path: "/api/donations/:id", handler: updateDonation, needsActor: true },
  { method: "DELETE", path: "/api/donations/:id", handler: deleteDonation, needsActor: true },
];
