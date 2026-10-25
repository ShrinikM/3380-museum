const pool = require("../db");
const { joinCurrentTerm, termStatus } = require("../terms");

const APPROVED_SCHOOL_DOMAINS = ["cougarnet.uh.edu"];

const selectMemberships = `
  SELECT
    m.MembershipID,
    m.CustomerID,
    c.FirstName,
    c.LastName,
    CONCAT(c.FirstName, ' ', c.LastName) AS Name,
    c.Email,
    c.Phone,
    c.SchoolEmail,
    DATE_FORMAT(c.DateOfBirth, '%Y-%m-%d') AS DateOfBirth,
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
    throw makeError(
      409,
      "A customer with this email or phone number already exists."
    );
  }

  throw error;
}

function calculateAge(dateOfBirth, onDate) {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  const date = new Date(`${onDate}T00:00:00Z`);

  let age = date.getUTCFullYear() - dob.getUTCFullYear();

  const birthdayHasNotOccurred =
    date.getUTCMonth() < dob.getUTCMonth() ||
    (
      date.getUTCMonth() === dob.getUTCMonth() &&
      date.getUTCDate() < dob.getUTCDate()
    );

  if (birthdayHasNotOccurred) {
    age--;
  }

  return age;
}

function validateDate(value, fieldName) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw makeError(400, `Please provide a valid ${fieldName}.`);
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw makeError(400, `Please provide a valid ${fieldName}.`);
  }

  return value;
}

function validateSchoolEmail(schoolEmail, membershipType) {
  if (membershipType !== "Student") {
    return null;
  }

  if (
    typeof schoolEmail !== "string" ||
    schoolEmail.trim() === ""
  ) {
    throw makeError(
      400,
      "School email is required for Student memberships."
    );
  }

  const email = schoolEmail.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw makeError(
      400,
      "Please enter a valid school email address."
    );
  }

  const domain = email.split("@").pop();

  if (!APPROVED_SCHOOL_DOMAINS.includes(domain)) {
    throw makeError(
      400,
      "Student memberships require an approved school email domain."
    );
  }

  return email;
}

function validateMembership(body) {
  const {
    FirstName,
    LastName,
    Email,
    Phone,
    SchoolEmail,
    DateOfBirth,
    MembershipType,
    StartDate,
    EndDate,
    Price,
    PaymentMethod,
    DiscountPercent,
    FamilyMembers = [],
  } = body;

  const allowedTypes = [
    "Individual",
    "Family",
    "Student",
    "Senior",
  ];

  const allowedPayments = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
  ];

  if (
    typeof FirstName !== "string" ||
    !FirstName.trim() ||
    typeof LastName !== "string" ||
    !LastName.trim() ||
    typeof Email !== "string" ||
    !Email.trim() ||
    !MembershipType ||
    !StartDate ||
    !EndDate ||
    !PaymentMethod
  ) {
    throw makeError(
      400,
      "Please provide all required membership fields."
    );
  }

  if (!allowedTypes.includes(MembershipType)) {
    throw makeError(400, "Invalid membership type.");
  }

  const validatedSchoolEmail = validateSchoolEmail(
    SchoolEmail,
    MembershipType
  );

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

  validateDate(StartDate, "start date");
  validateDate(EndDate, "end date");

  const start = new Date(`${StartDate}T00:00:00Z`);
  const end = new Date(`${EndDate}T00:00:00Z`);

  if (end <= start) {
    throw makeError(400, "Please provide valid membership dates.");
  }

  const maxEnd = new Date(start);
  maxEnd.setUTCFullYear(maxEnd.getUTCFullYear() + 1);

  if (end > maxEnd) {
    throw makeError(
      400,
      "Membership cannot be longer than one year."
    );
  }

  let phone = null;

  if (
    Phone !== undefined &&
    Phone !== null &&
    String(Phone).trim() !== ""
  ) {
    phone = onlyDigits(Phone);

    if (phone.length < 10 || phone.length > 15) {
      throw makeError(
        400,
        "Phone number must have 10 to 15 digits."
      );
    }
  }

  let validatedDateOfBirth = null;

  if (
    DateOfBirth !== undefined &&
    DateOfBirth !== null &&
    DateOfBirth !== ""
  ) {
    validatedDateOfBirth = validateDate(
      DateOfBirth,
      "date of birth"
    );

    if (validatedDateOfBirth >= StartDate) {
      throw makeError(
        400,
        "Date of birth must be before the membership start date."
      );
    }
  }

  if (
    MembershipType === "Senior" &&
    !validatedDateOfBirth
  ) {
    throw makeError(
      400,
      "Date of birth is required for Senior memberships."
    );
  }

  if (
    MembershipType === "Senior" &&
    calculateAge(validatedDateOfBirth, StartDate) < 65
  ) {
    throw makeError(
      400,
      "Senior memberships require the customer to be at least 65 years old when the membership starts."
    );
  }

  let validatedFamilyMembers = [];

  if (MembershipType === "Family") {
    if (!validatedDateOfBirth) {
      throw makeError(
        400,
        "Date of birth is required for the primary account holder of a Family membership."
      );
    }

    if (calculateAge(validatedDateOfBirth, StartDate) < 18) {
      throw makeError(
        400,
        "The primary account holder must be at least 18 years old when the Family membership starts."
      );
    }

    if (!Array.isArray(FamilyMembers)) {
      throw makeError(
        400,
        "Family members must be provided as a list."
      );
    }

    validatedFamilyMembers = FamilyMembers.map((member, index) => {
      if (
        !member ||
        typeof member !== "object" ||
        Array.isArray(member)
      ) {
        throw makeError(
          400,
          `Family member ${index + 1} is invalid.`
        );
      }

      const firstName =
        typeof member.FirstName === "string"
          ? member.FirstName.trim()
          : "";

      const lastName =
        typeof member.LastName === "string"
          ? member.LastName.trim()
          : "";

      if (!firstName || !lastName) {
        throw makeError(
          400,
          `Family member ${index + 1} requires a first name and last name.`
        );
      }

      const dob = validateDate(
        member.DateOfBirth,
        `date of birth for family member ${index + 1}`
      );

      if (dob >= StartDate) {
        throw makeError(
          400,
          `Family member ${index + 1} must have a date of birth before the membership start date.`
        );
      }

      return {
        FirstName: firstName,
        LastName: lastName,
        DateOfBirth: dob,
        Age: calculateAge(dob, StartDate),
      };
    });

    const adults =
      1 +
      validatedFamilyMembers.filter((member) => member.Age >= 18).length;

    const children =
      validatedFamilyMembers.filter((member) => member.Age < 18).length;

    const totalMembers = 1 + validatedFamilyMembers.length;

    if (adults > 2) {
      throw makeError(
        400,
        "Family memberships allow a maximum of 2 adults, including the primary account holder."
      );
    }

    if (children > 6) {
      throw makeError(
        400,
        "Family memberships allow a maximum of 6 children under 18."
      );
    }

    if (totalMembers > 8) {
      throw makeError(
        400,
        "Family memberships allow a maximum of 8 family members, including the primary account holder."
      );
    }
  } else if (
    !Array.isArray(FamilyMembers) ||
    FamilyMembers.length > 0
  ) {
    throw makeError(
      400,
      "Additional family members can only be added to Family memberships."
    );
  }

  return {
    FirstName: FirstName.trim(),
    LastName: LastName.trim(),
    Email: Email.trim().toLowerCase(),
    Phone: phone,
    SchoolEmail: validatedSchoolEmail,
    DateOfBirth: validatedDateOfBirth,
    MembershipType,
    StartDate,
    EndDate,
    Price: Number(Price),
    PaymentMethod,
    DiscountPercent: Number(DiscountPercent),
    FamilyMembers: validatedFamilyMembers,
  };
}

function checkId(params) {
  const id = Number(params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw makeError(400, "Invalid membership ID.");
  }

  return id;
}

async function addFamilyMembersToMemberships(rows, query = pool) {
  if (!rows.length) {
    return rows;
  }

  const ids = rows.map((row) => Number(row.MembershipID));
  const placeholders = ids.map(() => "?").join(", ");

  const [familyRows] = await query.query(
    `SELECT
       FamilyMemberID,
       MembershipID,
       FirstName,
       LastName,
       DATE_FORMAT(DateOfBirth, '%Y-%m-%d') AS DateOfBirth
     FROM membershipfamilymember
     WHERE MembershipID IN (${placeholders})
     ORDER BY FamilyMemberID`,
    ids
  );

  const familyByMembership = new Map();

  for (const member of familyRows) {
    const membershipId = Number(member.MembershipID);

    if (!familyByMembership.has(membershipId)) {
      familyByMembership.set(membershipId, []);
    }

    familyByMembership.get(membershipId).push({
      FamilyMemberID: Number(member.FamilyMemberID),
      FirstName: member.FirstName,
      LastName: member.LastName,
      DateOfBirth: member.DateOfBirth,
    });
  }

  return rows.map((row) => ({
    ...row,
    MembershipID: Number(row.MembershipID),
    CustomerID: Number(row.CustomerID),
    Price: Number(row.Price),
    DiscountPercent: Number(row.DiscountPercent),
    FamilyMembers:
      familyByMembership.get(Number(row.MembershipID)) || [],
  }));
}

async function getMemberships() {
  const [rows] = await pool.query(
    selectMemberships + " ORDER BY c.LastName, c.FirstName"
  );

  return {
    status: 200,
    data: await addFamilyMembersToMemberships(rows),
  };
}

async function findMembership(id) {
  const [rows] = await pool.query(
    selectMemberships + " AND m.MembershipID = ?",
    [id]
  );

  if (!rows.length) {
    throw makeError(404, "Membership not found.");
  }

  const [membership] = await addFamilyMembersToMemberships(rows);

  return membership;
}

async function insertFamilyMembers(connection, membershipId, members) {
  for (const member of members) {
    await connection.query(
      `INSERT INTO membershipfamilymember (
         MembershipID,
         FirstName,
         LastName,
         DateOfBirth,
         CreatedAt
       ) VALUES (?, ?, ?, ?, NOW())`,
      [
        membershipId,
        member.FirstName,
        member.LastName,
        member.DateOfBirth,
      ]
    );
  }
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
           FirstName,
           LastName,
           Email,
           Phone,
           SchoolEmail,
           DateOfBirth,
           CreatedAt,
           UpdatedAt,
           IsDeleted
         ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), 0)`,
        [
          membership.FirstName,
          membership.LastName,
          membership.Email,
          membership.Phone,
          membership.SchoolEmail,
          membership.DateOfBirth,
        ]
      );

      customerId = customer.insertId;
    } else {
      customerId = Number(customers[0].CustomerID);

      if (
        customers[0].MembershipID !== null &&
        Number(customers[0].IsDeleted) === 0
      ) {
        throw makeError(
          409,
          "This customer already has a membership."
        );
      }

      if (customers[0].MembershipID !== null) {
        membershipId = Number(customers[0].MembershipID);
      }

      await connection.query(
        `UPDATE customer
         SET FirstName = ?,
             LastName = ?,
             Phone = ?,
             SchoolEmail = ?,
             DateOfBirth = ?,
             UpdatedAt = NOW()
         WHERE CustomerID = ?`,
        [
          membership.FirstName,
          membership.LastName,
          membership.Phone,
          membership.SchoolEmail,
          membership.DateOfBirth,
          customerId,
        ]
      );
    }

    if (membershipId === 0) {
      const [result] = await connection.query(
        `INSERT INTO membership (
           CustomerID,
           CreatedAt,
           UpdatedAt,
           IsDeleted
         ) VALUES (?, NOW(), NOW(), 0)`,
        [customerId]
      );

      membershipId = result.insertId;
    } else {
      await connection.query(
        `UPDATE membership
         SET IsDeleted = 0,
             UpdatedAt = NOW()
         WHERE MembershipID = ?`,
        [membershipId]
      );
    }

    await connection.query(
      `INSERT INTO membershipterm (
         MembershipID,
         MembershipType,
         StartDate,
         EndDate,
         Price,
         DiscountPercent,
         PaymentMethod,
         CreatedAt
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

    await connection.query(
      "DELETE FROM membershipfamilymember WHERE MembershipID = ?",
      [membershipId]
    );

    if (membership.MembershipType === "Family") {
      await insertFamilyMembers(
        connection,
        membershipId,
        membership.FamilyMembers
      );
    }

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
           c.SchoolEmail = ?,
           c.DateOfBirth = ?,
           c.UpdatedAt = NOW(),
           m.UpdatedAt = NOW()
       WHERE m.MembershipID = ? AND m.IsDeleted = 0`,
      [
        membership.FirstName,
        membership.LastName,
        membership.Email,
        membership.Phone,
        membership.SchoolEmail,
        membership.DateOfBirth,
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

    await connection.query(
      "DELETE FROM membershipfamilymember WHERE MembershipID = ?",
      [id]
    );

    if (membership.MembershipType === "Family") {
      await insertFamilyMembers(
        connection,
        id,
        membership.FamilyMembers
      );
    }

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
     SET IsDeleted = 1,
         UpdatedAt = NOW()
     WHERE MembershipID = ?
       AND IsDeleted = 0`,
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
