const pool = require("../db");

const roles = ["Admin", "Staff"];

const selectStaff = `
  SELECT
    StaffID,
    FirstName,
    LastName,
    Role,
    Department,
    DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
    DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
    Email,
    PhoneNumber,
    CreatedAt,
    UpdatedAt
  FROM staff
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

function checkEmail(value) {
  const email = checkText(value, "Email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw makeError(400, "Please enter a valid email address");
  }
  return email;
}

// Same rule as customers and members: exactly 10 digits, stored as digits only
function checkPhone(value) {
  const phone = checkText(value, "Phone number").replace(/\D/g, "");
  if (phone.length !== 10) {
    throw makeError(400, "Phone number must have 10 digits");
  }
  return phone;
}

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

function checkName(value, label) {
  const name = checkText(value, label);
  if (!namePattern.test(name)) {
    throw makeError(400, label + " can only contain letters, spaces, hyphens, or apostrophes");
  }
  return name;
}

function checkDate(value, fieldName) {
  if (typeof value !== "string") {
    throw makeError(400, "Please select a valid " + fieldName);
  }

  const date = new Date(value);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw makeError(400, "Please select a valid " + fieldName);
  }
  if (value < "1900-01-01") {
    throw makeError(400, "Please select a valid " + fieldName);
  }

  return value;
}

function checkStaff(body) {
  const staff = {};

  staff.FirstName = checkName(body.FirstName, "First name");
  staff.LastName = checkName(body.LastName, "Last name");
  staff.Department = checkText(body.Department, "Department");
  staff.Email = checkEmail(body.Email);
  staff.PhoneNumber = checkPhone(body.PhoneNumber);

  staff.Role = checkText(body.Role, "Role");
  if (!roles.includes(staff.Role)) {
    throw makeError(400, "Please select a role");
  }

  if (body.StartDate === undefined || body.StartDate === null || body.StartDate === "") {
    throw makeError(400, "Start date is required");
  }
  staff.StartDate = checkDate(body.StartDate, "start date");

  staff.EndDate = null;
  if (body.EndDate !== undefined && body.EndDate !== null && body.EndDate !== "") {
    staff.EndDate = checkDate(body.EndDate, "end date");
    if (staff.EndDate < staff.StartDate) {
      throw makeError(400, "End date cannot be before the start date");
    }
  }

  return staff;
}

function checkId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw makeError(400, "Staff id must be a whole number greater than 0");
  }
  return id;
}

async function findStaff(id) {
  const [rows] = await pool.query(selectStaff + " AND StaffID = ?", [id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function checkEmailIsFree(email, ignoreId) {
  const [rows] = await pool.query(
    "SELECT StaffID FROM staff WHERE Email = ? AND IsDeleted = 0 AND StaffID <> ?",
    [email, ignoreId]
  );
  if (rows.length > 0) {
    throw makeError(409, "This email address is already assigned to another staff member");
  }
}

async function getStaff(params, body, staffId) {
  const [rows] = await pool.query(selectStaff + " ORDER BY LastName, FirstName");
  return { status: 200, data: rows };
}

async function addStaff(params, body, staffId) {
  const staff = checkStaff(body);
  await checkEmailIsFree(staff.Email, 0);

  const [result] = await pool.query(
    `INSERT INTO staff
      (FirstName, LastName, Role, Department, StartDate, EndDate, Email, PhoneNumber, CreatedAt, UpdatedAt, CreatedBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
    [
      staff.FirstName,
      staff.LastName,
      staff.Role,
      staff.Department,
      staff.StartDate,
      staff.EndDate,
      staff.Email,
      staff.PhoneNumber,
      staffId,
    ]
  );

  const newStaff = await findStaff(result.insertId);
  return { status: 201, data: newStaff };
}

async function updateStaff(params, body, staffId) {
  const id = checkId(params);
  const staff = checkStaff(body);

  const existingStaff = await findStaff(id);
  if (existingStaff === null) {
    throw makeError(404, "Staff member not found");
  }

  await checkEmailIsFree(staff.Email, id);

  await pool.query(
    `UPDATE staff
     SET FirstName = ?, LastName = ?, Role = ?, Department = ?, StartDate = ?, EndDate = ?, Email = ?, PhoneNumber = ?, UpdatedAt = NOW()
     WHERE StaffID = ?`,
    [
      staff.FirstName,
      staff.LastName,
      staff.Role,
      staff.Department,
      staff.StartDate,
      staff.EndDate,
      staff.Email,
      staff.PhoneNumber,
      id,
    ]
  );

  const updatedStaff = await findStaff(id);
  return { status: 200, data: updatedStaff };
}

async function deleteStaff(params, body, staffId) {
  const id = checkId(params);

  const existingStaff = await findStaff(id);
  if (existingStaff === null) {
    throw makeError(404, "Staff member not found");
  }

  if (id === staffId) {
    throw makeError(409, "You cannot delete your own account");
  }

  await pool.query("UPDATE staff SET IsDeleted = 1, UpdatedAt = NOW() WHERE StaffID = ?", [id]);

  return { status: 200, data: { message: "Staff member deleted" } };
}

module.exports = [
  { method: "GET", path: "/api/staff", handler: getStaff },
  { method: "POST", path: "/api/staff", handler: addStaff, needsActor: true },
  { method: "PUT", path: "/api/staff/:id", handler: updateStaff, needsActor: true },
  { method: "DELETE", path: "/api/staff/:id", handler: deleteStaff, needsActor: true },
];
