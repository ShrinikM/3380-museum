const pool = require("../db");

async function getMemberships() {
  const [rows] = await pool.query(
    `SELECT
       MembershipID,
       FirstName,
       LastName,
       CONCAT(FirstName, ' ', LastName) AS Name,
       Email,
       MembershipType,
       DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
       Price,
       PaymentMethod,
       DiscountPercent
     FROM membership
     WHERE IsDeleted = 0
     ORDER BY LastName, FirstName`
  );

  return {
    status: 200,
    data: rows.map((membership) => ({
      ...membership,
      MembershipID: Number(membership.MembershipID),
      Price: Number(membership.Price),
      DiscountPercent: Number(membership.DiscountPercent),
    })),
  };
}

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateMembership(body) {
  const {
    FirstName,
    LastName,
    Email,
    MembershipType,
    StartDate,
    EndDate,
    Price,
    PaymentMethod,
    DiscountPercent,
  } = body;

  const allowedTypes = ["Individual", "Family", "Student", "Senior"];
  const allowedPayments = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
  ];

  if (
    !FirstName?.trim() ||
    !LastName?.trim() ||
    !Email?.trim() ||
    !MembershipType ||
    !StartDate ||
    !EndDate ||
    !PaymentMethod
  ) {
    throw makeError(400, "Please provide all required membership fields.");
  }

  if (!allowedTypes.includes(MembershipType)) {
    throw makeError(400, "Invalid membership type.");
  }

  if (!allowedPayments.includes(PaymentMethod)) {
    throw makeError(400, "Invalid payment method.");
  }

  if (
    !Number.isFinite(Number(Price)) ||
    Number(Price) <= 0 ||
    !Number.isFinite(Number(DiscountPercent)) ||
    Number(DiscountPercent) < 0 ||
    Number(DiscountPercent) > 100
  ) {
    throw makeError(400, "Invalid price or discount.");
  }

  const start = new Date(`${StartDate}T00:00:00Z`);
  const end = new Date(`${EndDate}T00:00:00Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(StartDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(EndDate) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== StartDate ||
    end.toISOString().slice(0, 10) !== EndDate ||
    end < start
  ) {
    throw makeError(400, "Please provide valid membership dates.");
  }

  const maxEnd = new Date(start);
  maxEnd.setUTCFullYear(maxEnd.getUTCFullYear() + 1);

  if (end > maxEnd) {
    throw makeError(400, "Membership cannot be longer than one year.");
  }

  return {
    FirstName: FirstName.trim(),
    LastName: LastName.trim(),
    Email: Email.trim(),
    MembershipType,
    StartDate,
    EndDate,
    Price: Number(Price),
    PaymentMethod,
    DiscountPercent: Number(DiscountPercent),
  };
}

function checkId(params) {
  const id = Number(params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw makeError(400, "Invalid membership ID.");
  }

  return id;
}

async function findMembership(id) {
  const [rows] = await pool.query(
    `SELECT
       MembershipID,
       FirstName,
       LastName,
       CONCAT(FirstName, ' ', LastName) AS Name,
       Email,
       MembershipType,
       DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
       Price,
       PaymentMethod,
       DiscountPercent
     FROM membership
     WHERE MembershipID = ? AND IsDeleted = 0`,
    [id]
  );

  if (!rows.length) {
    throw makeError(404, "Membership not found.");
  }

  const membership = rows[0];

  return {
    ...membership,
    MembershipID: Number(membership.MembershipID),
    Price: Number(membership.Price),
    DiscountPercent: Number(membership.DiscountPercent),
  };
}

async function addMembership(params, body) {
  const membership = validateMembership(body);

  const [result] = await pool.query(
    `INSERT INTO membership (
       FirstName, LastName, Email, MembershipType,
       StartDate, EndDate, Price, PaymentMethod,
       DiscountPercent, CreatedAt, UpdatedAt, IsDeleted
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0)`,
    [
      membership.FirstName,
      membership.LastName,
      membership.Email,
      membership.MembershipType,
      membership.StartDate,
      membership.EndDate,
      membership.Price,
      membership.PaymentMethod,
      membership.DiscountPercent,
    ]
  );

  return {
    status: 201,
    data: await findMembership(result.insertId),
  };
}

async function updateMembership(params, body) {
  const id = checkId(params);
  const membership = validateMembership(body);

  const [result] = await pool.query(
    `UPDATE membership
     SET FirstName = ?,
         LastName = ?,
         Email = ?,
         MembershipType = ?,
         StartDate = ?,
         EndDate = ?,
         Price = ?,
         PaymentMethod = ?,
         DiscountPercent = ?,
         UpdatedAt = NOW()
     WHERE MembershipID = ? AND IsDeleted = 0`,
    [
      membership.FirstName,
      membership.LastName,
      membership.Email,
      membership.MembershipType,
      membership.StartDate,
      membership.EndDate,
      membership.Price,
      membership.PaymentMethod,
      membership.DiscountPercent,
      id,
    ]
  );

  if (result.affectedRows === 0) {
    const existing = await findMembership(id);
    if (!existing) {
      throw makeError(404, "Membership not found.");
    }
  }

  return {
    status: 200,
    data: await findMembership(id),
  };
}

async function deleteMembership(params) {
  const id = checkId(params);

  const [result] = await pool.query(
    `UPDATE membership
     SET IsDeleted = 1, UpdatedAt = NOW()
     WHERE MembershipID = ? AND IsDeleted = 0`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw makeError(404, "Membership not found.");
  }

  return {
    status: 200,
    data: { message: "Membership deleted successfully." },
  };
}

module.exports = [
  {
    method: "GET",
    path: "/api/memberships",
    handler: getMemberships,
  },
  {
    method: "POST",
    path: "/api/memberships",
    handler: addMembership,
  },
  {
    method: "PUT",
    path: "/api/memberships/:id",
    handler: updateMembership,
  },
  {
    method: "DELETE",
    path: "/api/memberships/:id",
    handler: deleteMembership,
  },
];
