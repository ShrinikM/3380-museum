const pool = require("../db");
const { joinCurrentTerm, termStatus } = require("../terms");

const selectMemberships = `
  SELECT
    m.MembershipID,
    m.CustomerID,
    c.FirstName,
    c.LastName,
    CONCAT(c.FirstName, ' ', c.LastName) AS Name,
    c.Email,
    c.Phone,
    term.MembershipType,
    DATE_FORMAT(term.StartDate, '%Y-%m-%d') AS StartDate,
    DATE_FORMAT(term.EndDate, '%Y-%m-%d') AS EndDate,
    term.Price,
    term.PaymentMethod,
    term.DiscountPercent,
    ${termStatus} AS Status
  FROM membership m
  JOIN customer c
    ON c.CustomerID = m.CustomerID
  ${joinCurrentTerm("m")}
  WHERE m.IsDeleted = 0
`;

async function getMemberships() {
  const [rows] = await pool.query(
    selectMemberships + " ORDER BY c.LastName, c.FirstName"
  );

  return {
    status: 200,
    data: rows.map((membership) => ({
      ...membership,
      MembershipID: Number(membership.MembershipID),
      CustomerID: Number(membership.CustomerID),
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

function onlyDigits(value) {
  return String(value).replace(/\D/g, "");
}

function checkDuplicate(error) {
  if (error.code === "ER_DUP_ENTRY") {
    throw makeError(409, "A customer with this email or phone number already exists.");
  }

  throw error;
}

function validateMembership(body) {
  const {
    FirstName,
    LastName,
    Email,
    Phone,
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

  let phone = null;

  if (Phone !== undefined && Phone !== null && String(Phone).trim() !== "") {
    phone = onlyDigits(Phone);

    if (phone.length < 10 || phone.length > 15) {
      throw makeError(400, "Phone number must have 10 to 15 digits.");
    }
  }

  return {
    FirstName: FirstName.trim(),
    LastName: LastName.trim(),
    Email: Email.trim().toLowerCase(),
    Phone: phone,
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
    selectMemberships + " AND m.MembershipID = ?",
    [id]
  );

  if (!rows.length) {
    throw makeError(404, "Membership not found.");
  }

  const membership = rows[0];

  return {
    ...membership,
    MembershipID: Number(membership.MembershipID),
    CustomerID: Number(membership.CustomerID),
    Price: Number(membership.Price),
    DiscountPercent: Number(membership.DiscountPercent),
  };
}

async function addMembership(params, body) {
  const membership = validateMembership(body);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [customers] = await connection.query(
      `SELECT c.CustomerID, m.MembershipID, m.IsDeleted
       FROM customer c
       LEFT JOIN membership m
         ON m.CustomerID = c.CustomerID
       WHERE c.Email = ?
       FOR UPDATE`,
      [membership.Email]
    );

    let customerId = 0;
    let membershipId = 0;

    if (customers.length === 0) {
      const [customer] = await connection.query(
        `INSERT INTO customer (
           FirstName, LastName, Email, Phone,
           CreatedAt, UpdatedAt, IsDeleted
         ) VALUES (?, ?, ?, ?, NOW(), NOW(), 0)`,
        [
          membership.FirstName,
          membership.LastName,
          membership.Email,
          membership.Phone,
        ]
      );

      customerId = customer.insertId;
    } else {
      customerId = Number(customers[0].CustomerID);

      if (
        customers[0].MembershipID !== null &&
        Number(customers[0].IsDeleted) === 0
      ) {
        throw makeError(409, "This customer already has a membership.");
      }

      if (customers[0].MembershipID !== null) {
        membershipId = Number(customers[0].MembershipID);
      }
    }

    if (membershipId === 0) {
      const [result] = await connection.query(
        `INSERT INTO membership (
           CustomerID, CreatedAt, UpdatedAt, IsDeleted
         ) VALUES (?, NOW(), NOW(), 0)`,
        [customerId]
      );

      membershipId = result.insertId;
    } else {
      await connection.query(
        `UPDATE membership
         SET IsDeleted = 0, UpdatedAt = NOW()
         WHERE MembershipID = ?`,
        [membershipId]
      );
    }

    await connection.query(
      `INSERT INTO membershipterm (
         MembershipID, MembershipType, StartDate, EndDate, Price,
         DiscountPercent, PaymentMethod, CreatedAt
       ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        membershipId,
        membership.MembershipType,
        membership.StartDate,
        membership.EndDate,
        membership.Price,
        membership.DiscountPercent,
        membership.PaymentMethod,
      ]
    );

    await connection.commit();

    return {
      status: 201,
      data: await findMembership(membershipId),
    };
  } catch (error) {
    await connection.rollback();
    checkDuplicate(error);
  } finally {
    connection.release();
  }
}

async function updateMembership(params, body) {
  const id = checkId(params);
  const membership = validateMembership(body);

  await findMembership(id);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE customer c
       JOIN membership m
         ON m.CustomerID = c.CustomerID
       SET c.FirstName = ?,
           c.LastName = ?,
           c.Email = ?,
           c.Phone = ?,
           c.UpdatedAt = NOW(),
           m.UpdatedAt = NOW()
       WHERE m.MembershipID = ? AND m.IsDeleted = 0`,
      [
        membership.FirstName,
        membership.LastName,
        membership.Email,
        membership.Phone,
        id,
      ]
    );

    await connection.query(
      `UPDATE membershipterm
       SET MembershipType = ?,
           StartDate = ?,
           EndDate = ?,
           Price = ?,
           DiscountPercent = ?,
           PaymentMethod = ?
       WHERE TermID = (
         SELECT TermID FROM (
           SELECT TermID
           FROM membershipterm
           WHERE MembershipID = ?
           ORDER BY TermID DESC
           LIMIT 1
         ) AS latest
       )`,
      [
        membership.MembershipType,
        membership.StartDate,
        membership.EndDate,
        membership.Price,
        membership.DiscountPercent,
        membership.PaymentMethod,
        id,
      ]
    );

    await connection.commit();

    return {
      status: 200,
      data: await findMembership(id),
    };
  } catch (error) {
    await connection.rollback();
    checkDuplicate(error);
  } finally {
    connection.release();
  }
}

async function lookupMembership(params) {
  const search = String(params.q || "").trim();

  if (search === "") {
    throw makeError(400, "Enter an email or phone number.");
  }

  let where = "";
  let value = "";

  if (search.includes("@")) {
    where = "LOWER(c.Email) = ?";
    value = search.toLowerCase();
  } else {
    value = onlyDigits(search);
    where = "c.Phone = ?";

    if (value.length < 10) {
      throw makeError(400, "Enter a full phone number.");
    }
  }

  const [rows] = await pool.query(
    `SELECT
       m.MembershipID,
       CONCAT(c.FirstName, ' ', c.LastName) AS Name,
       term.MembershipType,
       term.DiscountPercent,
       DATE_FORMAT(term.StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(term.EndDate, '%Y-%m-%d') AS EndDate,
       ${termStatus} AS Status
     FROM membership m
     JOIN customer c
       ON c.CustomerID = m.CustomerID
     ${joinCurrentTerm("m")}
     WHERE m.IsDeleted = 0 AND ` + where,
    [value]
  );

  if (rows.length === 0) {
    throw makeError(404, "No membership found.");
  }

  return {
    status: 200,
    data: {
      ...rows[0],
      MembershipID: Number(rows[0].MembershipID),
      DiscountPercent: Number(rows[0].DiscountPercent),
    },
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
    method: "GET",
    path: "/api/memberships/lookup",
    handler: lookupMembership,
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
