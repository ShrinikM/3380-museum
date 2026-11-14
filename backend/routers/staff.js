const pool = require("../db");
const { checkStoredPassword } = require("../passwords");

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
    Street,
    City,
    State,
    ZipCode,
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

function checkOptionalText(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return checkText(value, fieldName);
}

function checkEmail(value) {
  const email = checkText(value, "Email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw makeError(400, "Please enter a valid email address");
  }
  return email;
}

function checkPhone(value) {
  const phone = checkText(value, "Phone number").replace(/\D/g, "");
  if (phone.length !== 10) {
    throw makeError(400, "Phone number must have 10 digits");
  }
  return phone;
}

function checkZipCode(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const zip = checkText(value, "Zip code");

  if (!/^[0-9]{5}$/.test(zip)) {
    throw makeError(400, "Zip code must be 5 digits");
  }

  return zip;
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
  staff.Street = checkOptionalText(body.Street, "Street");
  staff.City = checkOptionalText(body.City, "City");
  staff.State = checkOptionalText(body.State, "State");
  staff.ZipCode = checkZipCode(body.ZipCode);

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

async function loginStaff(params, body) {
  if (typeof body.Email !== "string" || body.Email.trim() === "") {
    throw makeError(400, "Please enter your email");
  }

  if (typeof body.Password !== "string" || body.Password === "") {
    throw makeError(400, "Please enter your password");
  }

  const email = body.Email.trim().toLowerCase();

  const [rows] = await pool.query(
    `SELECT
       s.StaffID,
       s.Email,
       s.Role,
       s.FirstName,
       s.LastName,
       sc.Password
     FROM staff s
     JOIN staffcredentials sc
       ON sc.StaffID = s.StaffID
     WHERE LOWER(s.Email) = ?
       AND s.IsDeleted = 0
       AND (s.EndDate IS NULL OR s.EndDate > CURDATE())`,
    [email]
  );

  if (rows.length === 0 || !checkStoredPassword(body.Password, rows[0].Password)) {
    throw makeError(401, "Invalid email or password");
  }

  return {
    status: 200,
    data: {
      StaffID: Number(rows[0].StaffID),
      Email: rows[0].Email,
      Role: rows[0].Role,
      FirstName: rows[0].FirstName,
      LastName: rows[0].LastName,
    },
  };
}

async function addStaff(params, body, staffId) {
  const staff = checkStaff(body);
  await checkEmailIsFree(staff.Email, 0);

  const [result] = await pool.query(
    `INSERT INTO staff
      (FirstName, LastName, Role, Department, StartDate, EndDate, Email, PhoneNumber,
       Street, City, State, ZipCode, CreatedAt, UpdatedAt, CreatedBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
    [
      staff.FirstName,
      staff.LastName,
      staff.Role,
      staff.Department,
      staff.StartDate,
      staff.EndDate,
      staff.Email,
      staff.PhoneNumber,
      staff.Street,
      staff.City,
      staff.State,
      staff.ZipCode,
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
     SET FirstName = ?,
         LastName = ?,
         Role = ?,
         Department = ?,
         StartDate = ?,
         EndDate = ?,
         Email = ?,
         PhoneNumber = ?,
         Street = ?,
         City = ?,
         State = ?,
         ZipCode = ?,
         UpdatedAt = NOW()
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
      staff.Street,
      staff.City,
      staff.State,
      staff.ZipCode,
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

  const [exhibitions] = await pool.query(
    `SELECT e.Name
     FROM exhibitionstaff es
     JOIN exhibition e ON e.ExhibitionID = es.ExhibitionID
     WHERE es.StaffID = ?
       AND e.IsDeleted = 0
       AND e.CancelledAt IS NULL
       AND e.EndDate >= CURDATE()
     ORDER BY e.StartDate`,
    [id]
  );

  if (exhibitions.length > 0) {
    throw makeError(
      409,
      "This staff member is assigned to " +
        exhibitions.map((row) => row.Name).join(", ") +
        ". Assign someone else to these exhibitions before deleting them."
    );
  }

  const [items] = await pool.query(
    `SELECT ItemName FROM giftshop WHERE StaffID = ? AND IsDeleted = 0
     UNION ALL
     SELECT ItemName FROM cafe WHERE StaffID = ? AND IsDeleted = 0`,
    [id, id]
  );

  if (items.length > 0) {
    throw makeError(
      409,
      `This staff member is responsible for ${items.length} gift shop or café ${items.length === 1 ? "item" : "items"}. Assign the items to someone else before deleting them.`
    );
  }

  await pool.query("UPDATE staff SET IsDeleted = 1, UpdatedAt = NOW() WHERE StaffID = ?", [id]);

  return { status: 200, data: { message: "Staff member deleted" } };
}

module.exports = [
  { method: "POST", path: "/api/staff/login", handler: loginStaff },
  { method: "GET", path: "/api/staff", handler: getStaff },
  { method: "POST", path: "/api/staff", handler: addStaff, needsActor: true },
  { method: "PUT", path: "/api/staff/:id", handler: updateStaff, needsActor: true },
  { method: "DELETE", path: "/api/staff/:id", handler: deleteStaff, needsActor: true },
];