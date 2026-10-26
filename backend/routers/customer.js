const pool = require("../db");
const {
  ticketPrices,
  ticketTypes,
  membershipPlans,
  membershipTypes,
} = require("../prices");
const { joinCurrentTerm, termStatus } = require("../terms");
const { hashPassword, checkPassword } = require("../passwords");
const { startSession, endSessions } = require("../sessions");

const onlinePayments = ["Credit Card", "Debit Card", "Mobile Pay"];

const membershipPayments = ["Credit Card", "Debit Card"];

const maxPerOrder = 20;

const waitlistLimit = 10;

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function money(value) {
  return Number(Number(value).toFixed(2));
}

function onlyDigits(value) {
  return String(value).replace(/\D/g, "");
}

function checkPositiveId(value, label) {
  const id = Number(value);

  if (
    value === "" ||
    value === null ||
    value === undefined ||
    !Number.isSafeInteger(id) ||
    id < 1
  ) {
    throw makeError(400, `Please select a valid ${label}`);
  }

  return id;
}

function checkName(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw makeError(400, `${label} is required`);
  }

  if (value.trim().length > 255) {
    throw makeError(400, `${label} must be 255 characters or fewer`);
  }

  return value.trim();
}

function checkEmail(value) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    throw makeError(400, "Please enter a valid email address");
  }

  return email;
}

function checkPhone(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const phone = onlyDigits(value);

  if (phone.length < 10 || phone.length > 15) {
    throw makeError(400, "Phone number must have 10 to 15 digits");
  }

  return phone;
}

function checkNewPassword(value) {
  if (typeof value !== "string" || value.length < 8 || value.length > 100) {
    throw makeError(400, "Password must be 8 to 100 characters");
  }

  return value;
}


function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00.000Z");

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function getAgeOnDate(dateOfBirth, visitDate) {
  if (!isValidDate(dateOfBirth) || dateOfBirth > visitDate) {
    throw makeError(
      400,
      "Enter a valid date of birth before or on the visit date"
    );
  }

  const birth = new Date(dateOfBirth + "T00:00:00.000Z");
  const visit = new Date(visitDate + "T00:00:00.000Z");

  let age = visit.getUTCFullYear() - birth.getUTCFullYear();

  const birthdayHasPassed =
    visit.getUTCMonth() > birth.getUTCMonth() ||
    (
      visit.getUTCMonth() === birth.getUTCMonth() &&
      visit.getUTCDate() >= birth.getUTCDate()
    );

  if (!birthdayHasPassed) {
    age--;
  }

  return age;
}

function validateVisitor(visitor, visitDate) {
  if (
    !visitor ||
    typeof visitor !== "object" ||
    Array.isArray(visitor)
  ) {
    throw makeError(
      400,
      "Visitor details are required for every ticket"
    );
  }

  const type = visitor.TicketType;

  if (!ticketTypes.includes(type)) {
    throw makeError(400, "Please select a valid ticket type");
  }

  const age = getAgeOnDate(visitor.DateOfBirth, visitDate);

  if (type === "Adult" && age < 18) {
    throw makeError(
      400,
      "Adult tickets require visitors to be at least 18"
    );
  }

  if (type === "Senior" && age < 65) {
    throw makeError(
      400,
      "Senior tickets require visitors to be at least 65"
    );
  }

  if (type === "Child" && age >= 18) {
    throw makeError(
      400,
      "Child tickets require visitors to be under 18"
    );
  }

  if (type === "Student") {
    const email =
      typeof visitor.StudentEmail === "string"
        ? visitor.StudentEmail.trim()
        : "";

    if (!/^[^\s@]+@cougarnet\.uh\.edu$/i.test(email)) {
      throw makeError(
        400,
        "Student tickets require a cougarnet.uh.edu email address"
      );
    }
  }

  return type;
}


function checkRegistration(body) {
  return {
    FirstName: checkName(body.FirstName, "First name"),
    LastName: checkName(body.LastName, "Last name"),
    Email: checkEmail(body.Email),
    Phone: checkPhone(body.Phone),
    Password: checkNewPassword(body.Password),
  };
}

async function findCustomer(customerId) {
  const [rows] = await pool.query(
    `SELECT CustomerID, FirstName, LastName, Email, Phone
     FROM customer
     WHERE CustomerID = ?
       AND IsDeleted = 0`,
    [customerId]
  );

  if (rows.length === 0) {
    throw makeError(401, "Please log in to continue");
  }

  return {
    ...rows[0],
    CustomerID: Number(rows[0].CustomerID),
  };
}

async function registerCustomer(params, body) {
  const details = checkRegistration(body);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT c.CustomerID, c.IsDeleted, cc.CustomerID AS HasLogin
       FROM customer c
       LEFT JOIN customercredentials cc
         ON cc.CustomerID = c.CustomerID
       WHERE c.Email = ?
       FOR UPDATE`,
      [details.Email]
    );

    let customerId = 0;

    if (rows.length > 0) {
      if (Number(rows[0].IsDeleted) === 1 || rows[0].HasLogin !== null) {
        throw makeError(409, "An account with this email already exists");
      }

      customerId = Number(rows[0].CustomerID);
    } else {
      const [result] = await connection.query(
        `INSERT INTO customer
          (FirstName, LastName, Email, Phone,
           CreatedAt, UpdatedAt, CreatedBy, IsDeleted)
         VALUES (?, ?, ?, ?, NOW(), NOW(), NULL, 0)`,
        [details.FirstName, details.LastName, details.Email, details.Phone]
      );

      customerId = result.insertId;
    }

    await connection.query(
      `INSERT INTO customercredentials
        (CustomerID, PasswordHash, CreatedAt, UpdatedAt)
       VALUES (?, ?, NOW(), NOW())`,
      [customerId, hashPassword(details.Password)]
    );

    await connection.commit();

    return {
      status: 201,
      data: {
        token: startSession(customerId),
        customer: await findCustomer(customerId),
      },
    };
  } catch (error) {
    await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      throw makeError(
        409,
        "An account with this email or phone number already exists"
      );
    }

    throw error;
  } finally {
    connection.release();
  }
}

async function loginCustomer(params, body) {
  const email = checkEmail(body.Email);

  if (typeof body.Password !== "string" || body.Password === "") {
    throw makeError(400, "Please enter your password");
  }

  const [rows] = await pool.query(
    `SELECT c.CustomerID, cc.PasswordHash
     FROM customer c
     JOIN customercredentials cc
       ON cc.CustomerID = c.CustomerID
     WHERE c.Email = ?
       AND c.IsDeleted = 0`,
    [email]
  );

  if (rows.length === 0 || !checkPassword(body.Password, rows[0].PasswordHash)) {
    throw makeError(401, "Wrong email or password");
  }

  const customerId = Number(rows[0].CustomerID);

  return {
    status: 200,
    data: {
      token: startSession(customerId),
      customer: await findCustomer(customerId),
    },
  };
}

async function logoutCustomer(params, body, customerId) {
  endSessions(customerId);

  return {
    status: 200,
    data: { message: "Logged out" },
  };
}

async function findMembership(customerId) {
  const [rows] = await pool.query(
    `SELECT
       m.MembershipID,
       term.TermID,
       term.MembershipType,
       DATE_FORMAT(term.StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(term.EndDate, '%Y-%m-%d') AS EndDate,
       term.DiscountPercent,
       ${termStatus} AS Status
     FROM membership m
     ${joinCurrentTerm("m")}
     WHERE m.IsDeleted = 0
       AND m.CustomerID = ?`,
    [customerId]
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    ...rows[0],
    MembershipID: Number(rows[0].MembershipID),
    TermID: Number(rows[0].TermID),
    DiscountPercent: Number(rows[0].DiscountPercent),
  };
}

async function findTerms(membershipId) {
  const [rows] = await pool.query(
    `SELECT
       TermID,
       MembershipType,
       DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
       Price,
       PaymentMethod,
       CASE
         WHEN CancelledAt IS NOT NULL THEN 'cancelled'
         WHEN EndDate < CURDATE() THEN 'expired'
         WHEN StartDate > CURDATE() THEN 'upcoming'
         ELSE 'active'
       END AS Status
     FROM membershipterm
     WHERE MembershipID = ?
     ORDER BY TermID DESC`,
    [membershipId]
  );

  return rows.map((term) => ({
    ...term,
    TermID: Number(term.TermID),
    Price: Number(term.Price),
  }));
}

function getDiscount(membership) {
  if (membership !== null && membership.Status === "active") {
    return membership.DiscountPercent;
  }

  return 0;
}


function getTicketDiscount(membership, ticketType) {
  if (membership === null || membership.Status !== "active") {
    return 0;
  }

  const eligibleTypes = {
    Individual: ["Adult"],
    Family: ["Adult", "Child"],
    Student: ["Student"],
    Senior: ["Senior"],
  };

  const eligible = eligibleTypes[membership.MembershipType] || [];

  if (!eligible.includes(ticketType)) {
    return 0;
  }

  return Number(membership.DiscountPercent);
}


function getActiveMembershipID(membership) {
  if (membership !== null && membership.Status === "active") {
    return membership.MembershipID;
  }

  return null;
}

const openExhibition = `
  e.IsDeleted = 0
  AND e.CancelledAt IS NULL
  AND e.StartDate <= CURDATE()
  AND e.EndDate >= CURDATE()
`;

async function countSold(connection, exhibitionId) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS Total
     FROM ticket
     WHERE ExhibitionID = ?
       AND IsDeleted = 0
       AND RefundStatus <> 'Refunded'`,
    [exhibitionId]
  );

  return Number(rows[0].Total);
}

async function getAccount(params, body, customerId) {
  const customer = await findCustomer(customerId);
  const membership = await findMembership(customerId);

  return {
    status: 200,
    data: {
      customer: customer,
      membership: membership,
      terms: membership === null ? [] : await findTerms(membership.MembershipID),
      plans: membershipTypes.map((type) => ({
        MembershipType: type,
        ...membershipPlans[type],
      })),
    },
  };
}

async function cancelMembership(params, body, customerId) {
  await findCustomer(customerId);
  const membership = await findMembership(customerId);

  if (membership === null) {
    throw makeError(404, "You do not have a membership to cancel");
  }

  if (membership.Status !== "active" && membership.Status !== "upcoming") {
    throw makeError(400, "Your membership is not active");
  }

  await pool.query(
    `UPDATE membershipterm
     SET CancelledAt = NOW()
     WHERE TermID = ? AND CancelledAt IS NULL`,
    [membership.TermID]
  );

  return {
    status: 200,
    data: { message: "Membership cancelled" },
  };
}

function checkRenewal(body) {
  if (!membershipTypes.includes(body.MembershipType)) {
    throw makeError(400, "Please select a membership plan");
  }

  if (!membershipPayments.includes(body.PaymentMethod)) {
    throw makeError(400, "Please select a valid payment method");
  }

  return {
    MembershipType: body.MembershipType,
    PaymentMethod: body.PaymentMethod,
  };
}

async function renewMembership(params, body, customerId) {
  await findCustomer(customerId);
  const renewal = checkRenewal(body);
  const membership = await findMembership(customerId);

  if (
    membership !== null &&
    membership.Status === "active" &&
    membership.MembershipType === renewal.MembershipType
  ) {
    throw makeError(400, `You are already on the ${renewal.MembershipType} plan`);
  }

  const plan = membershipPlans[renewal.MembershipType];
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT MembershipID
       FROM membership
       WHERE CustomerID = ?
       FOR UPDATE`,
      [customerId]
    );

    let membershipId = 0;

    if (existing.length === 0) {
      const [result] = await connection.query(
        `INSERT INTO membership
          (CustomerID, CreatedAt, UpdatedAt, CreatedBy, IsDeleted)
         VALUES (?, NOW(), NOW(), NULL, 0)`,
        [customerId]
      );

      membershipId = result.insertId;
    } else {
      membershipId = Number(existing[0].MembershipID);

      await connection.query(
        `UPDATE membership
         SET IsDeleted = 0, UpdatedAt = NOW()
         WHERE MembershipID = ?`,
        [membershipId]
      );
    }

    await connection.query(
      `UPDATE membershipterm
       SET CancelledAt = NOW()
       WHERE MembershipID = ?
         AND CancelledAt IS NULL
         AND EndDate >= CURDATE()`,
      [membershipId]
    );

    await connection.query(
      `INSERT INTO membershipterm
        (MembershipID, MembershipType, StartDate, EndDate, Price,
         DiscountPercent, PaymentMethod, CreatedAt, CreatedBy)
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
               ?, ?, ?, NOW(), NULL)`,
      [
        membershipId,
        renewal.MembershipType,
        plan.Price,
        plan.DiscountPercent,
        renewal.PaymentMethod,
      ]
    );

    await connection.commit();

    return {
      status: 201,
      data: { message: "Membership renewed", total: plan.Price },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getPurchases(params, body, customerId) {
  await findCustomer(customerId);

  const [tickets] = await pool.query(
    `SELECT
       t.TicketID,
       e.Name AS ExhibitionName,
       e.CancellationReason,
       t.TicketType,
       t.Price,
       t.RefundStatus,
       t.NotificationStatus,
       DATE_FORMAT(t.SaleDate, '%Y-%m-%d') AS SaleDate,
       DATE_FORMAT(t.VisitDate, '%Y-%m-%d') AS VisitDate,
       DATE_FORMAT(t.UpdatedAt, '%Y-%m-%d') AS UpdatedAt,
       DATE_FORMAT(e.CancelledAt, '%Y-%m-%d') AS CancelledAt
     FROM ticket t
     JOIN exhibition e
       ON e.ExhibitionID = t.ExhibitionID
     WHERE t.IsDeleted = 0
       AND t.CustomerID = ?
     ORDER BY t.SaleDate DESC, t.TicketID DESC`,
    [customerId]
  );

  const [orders] = await pool.query(
    `SELECT
       s.SaleID,
       i.ItemName,
       s.Quantity,
       s.SalePrice * s.Quantity AS Total,
       s.PaymentMethod,
       DATE_FORMAT(s.SaleDate, '%Y-%m-%d') AS SaleDate
     FROM giftshopsale s
     JOIN giftshop i
       ON i.ItemID = s.ItemID
     WHERE s.IsDeleted = 0
       AND s.CustomerID = ?
     ORDER BY s.SaleDate DESC, s.SaleID DESC`,
    [customerId]
  );

  const [waitlist] = await pool.query(
    `SELECT
       w.WaitlistID,
       e.Name AS ExhibitionName,
       w.TicketType,
       w.Status,
       e.CancelledAt IS NOT NULL AS ExhibitionCancelled,
       DATE_FORMAT(w.CreatedAt, '%Y-%m-%d') AS JoinedAt,
       DATE_FORMAT(w.NotifiedAt, '%Y-%m-%d') AS NotifiedAt
     FROM waitlist w
     JOIN exhibition e
       ON e.ExhibitionID = w.ExhibitionID
     WHERE w.CustomerID = ?
     ORDER BY w.WaitlistID DESC`,
    [customerId]
  );

  return {
    status: 200,
    data: {
      tickets: tickets.map((ticket) => ({
        ...ticket,
        TicketID: Number(ticket.TicketID),
        Price: Number(ticket.Price),
      })),
      orders: orders.map((order) => ({
        ...order,
        SaleID: Number(order.SaleID),
        Quantity: Number(order.Quantity),
        Total: money(order.Total),
      })),
      waitlist: waitlist.map((entry) => ({
        ...entry,
        WaitlistID: Number(entry.WaitlistID),
        ExhibitionCancelled: Number(entry.ExhibitionCancelled) === 1,
      })),
    },
  };
}

async function getMyAlerts(params, body, customerId) {
  await findCustomer(customerId);
  const alerts = [];

  const [cancelled] = await pool.query(
    `SELECT
       e.Name,
       SUM(t.RefundStatus = 'Pending') AS Pending,
       SUM(t.RefundStatus = 'Refunded') AS Refunded
     FROM ticket t
     JOIN exhibition e
       ON e.ExhibitionID = t.ExhibitionID
     WHERE t.IsDeleted = 0
       AND t.CustomerID = ?
       AND t.NotificationStatus = 'Sent'
       AND e.CancelledAt IS NOT NULL
       AND t.UpdatedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY e.ExhibitionID, e.Name
     ORDER BY e.Name`,
    [customerId]
  );

  for (const item of cancelled) {
    const parts = [];

    if (Number(item.Pending) > 0) {
      parts.push(Number(item.Pending) + " refund pending");
    }

    if (Number(item.Refunded) > 0) {
      parts.push(Number(item.Refunded) + " refunded");
    }

    alerts.push({
      Paths: ["/account"],
      Message: item.Name + " was cancelled: " + parts.join(", "),
    });
  }

  const [spots] = await pool.query(
    `SELECT e.Name
     FROM waitlist w
     JOIN exhibition e
       ON e.ExhibitionID = w.ExhibitionID
     WHERE w.CustomerID = ?
       AND w.Status = 'Notified'
     ORDER BY w.WaitlistID`,
    [customerId]
  );

  for (const spot of spots) {
    alerts.push({
      Paths: ["/account"],
      Message: "A spot opened up for " + spot.Name,
    });
  }

  return { status: 200, data: alerts };
}



async function getExhibitions(params, body, customerId) {
  await findCustomer(customerId);
  const membership = await findMembership(customerId);

  const [rows] = await pool.query(
    `SELECT
       e.ExhibitionID,
       e.Name,
       e.Description,
       DATE_FORMAT(e.StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(e.EndDate, '%Y-%m-%d') AS EndDate,
       GREATEST(
         e.Capacity - (
           SELECT COUNT(*)
           FROM ticket t
           WHERE t.ExhibitionID = e.ExhibitionID
             AND t.IsDeleted = 0
             AND t.RefundStatus <> 'Refunded'
         ),
         0
       ) AS Remaining,
       (
         SELECT COUNT(*)
         FROM waitlist w
         WHERE w.ExhibitionID = e.ExhibitionID
           AND w.Status IN ('Waiting', 'Notified')
       ) AS WaitlistCount
     FROM exhibition e
     WHERE e.IsDeleted = 0
       AND e.CancelledAt IS NULL
       AND e.EndDate >= CURDATE()
     ORDER BY e.StartDate, e.Name`
  );

  const [waitlist] = await pool.query(
    `SELECT
       w.WaitlistID,
       w.ExhibitionID,
       e.Name AS ExhibitionName,
       w.TicketType,
       w.Status
     FROM waitlist w
     JOIN exhibition e
       ON e.ExhibitionID = w.ExhibitionID
     WHERE w.CustomerID = ?
       AND w.Status IN ('Waiting', 'Notified')
     ORDER BY w.WaitlistID`,
    [customerId]
  );

  return {
    status: 200,
    data: {
      exhibitions: rows.map((exhibition) => ({
        ...exhibition,
        ExhibitionID: Number(exhibition.ExhibitionID),
        Remaining: Number(exhibition.Remaining),
        WaitlistCount: Number(exhibition.WaitlistCount),
        WaitlistFull:
          Number(exhibition.WaitlistCount) >= waitlistLimit,
      })),
      waitlist: waitlist.map((entry) => ({
        ...entry,
        WaitlistID: Number(entry.WaitlistID),
        ExhibitionID: Number(entry.ExhibitionID),
      })),
      prices: ticketPrices,
      discount: getDiscount(membership),
      discounts: Object.fromEntries(
        ticketTypes.map((type) => [
          type,
          getTicketDiscount(membership, type),
        ])
      ),
      waitlistLimit: waitlistLimit,
    },
  };
}



function checkTicketOrder(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw makeError(400, "Invalid ticket order");
  }

  const exhibitionID = checkPositiveId(
    body.ExhibitionID,
    "exhibition"
  );

  if (!isValidDate(body.VisitDate)) {
    throw makeError(400, "Please select a valid visit date");
  }

  if (
    !Array.isArray(body.Visitors) ||
    body.Visitors.length === 0
  ) {
    throw makeError(
      400,
      "Please provide visitor details for every ticket"
    );
  }

  if (body.Visitors.length > maxPerOrder) {
    throw makeError(
      400,
      `You can buy up to ${maxPerOrder} tickets at a time`
    );
  }

  const visitors = [];
  const counts = {};

  for (const visitor of body.Visitors) {
    const type = validateVisitor(visitor, body.VisitDate);

    visitors.push({
      TicketType: type,
    });

    counts[type] = (counts[type] || 0) + 1;
  }

  return {
    ExhibitionID: exhibitionID,
    VisitDate: body.VisitDate,
    Visitors: visitors,
    Counts: counts,
    Count: visitors.length,
  };
}



async function addTickets(params, body, customerId) {
  await findCustomer(customerId);

  const order = checkTicketOrder(body);
  const membership = await findMembership(customerId);
  const membershipID = getActiveMembershipID(membership);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [exhibitions] = await connection.query(
      `SELECT
         e.ExhibitionID,
         e.Capacity,
         DATE_FORMAT(e.StartDate, '%Y-%m-%d') AS StartDate,
         DATE_FORMAT(e.EndDate, '%Y-%m-%d') AS EndDate
         FROM exhibition e
         WHERE e.ExhibitionID = ?
         AND e.IsDeleted = 0
         AND e.CancelledAt IS NULL
         AND e.EndDate >= CURDATE()
       FOR UPDATE`,
      [order.ExhibitionID]
    );

    if (exhibitions.length === 0) {
      throw makeError(
        400,
        "That exhibition is unavailable for ticket purchases"
      );
    }

    const exhibition = exhibitions[0];

    if (
      order.VisitDate < exhibition.StartDate ||
      order.VisitDate > exhibition.EndDate
    ) {
      throw makeError(
        400,
        "The visit date must be within the exhibition's start and end dates"
      );
    }

    const sold = await countSold(connection, order.ExhibitionID);
    const remaining = Number(exhibition.Capacity) - sold;

    if (order.Count > remaining) {
      throw makeError(
        400,
        "Not enough tickets left for this exhibition"
      );
    }

    let total = 0;

    const discountedCounts = {
      Adult: 0,
      Child: 0,
      Student: 0,
      Senior: 0,
    };

    for (const visitor of order.Visitors) {
      const type = visitor.TicketType;
      let discount = getTicketDiscount(membership, type);

      if (membership !== null && membership.Status === "active") {
        switch (membership.MembershipType) {
          case "Individual":
            if (type === "Adult" && discountedCounts.Adult >= 1) {
              discount = 0;
            }
            break;

          case "Family":
            if (type === "Adult" && discountedCounts.Adult >= 2) {
              discount = 0;
            }

            if (type === "Child" && discountedCounts.Child >= 6) {
              discount = 0;
            }
            break;

          case "Student":
            if (type === "Student" && discountedCounts.Student >= 1) {
              discount = 0;
            }
            break;

          case "Senior":
            if (type === "Senior" && discountedCounts.Senior >= 1) {
              discount = 0;
            }
            break;
        }
      }

      const price = money(
        ticketPrices[type] * (1 - discount / 100)
      );

      await connection.query(
        `INSERT INTO ticket
      (TicketType, Price, SaleDate, VisitDate,
       ExhibitionID, MembershipID, CustomerID,
       CreatedAt, UpdatedAt, CreatedBy, IsDeleted)
     VALUES (?, ?, CURDATE(), ?, ?, ?, ?, NOW(), NOW(), NULL, 0)`,
        [
          type,
          price,
          order.VisitDate,
          order.ExhibitionID,
          membershipID,
          customerId,
        ]
      );

      if (discount > 0) {
        discountedCounts[type]++;
      }

      total += price;
    }

    await connection.query(
      `UPDATE waitlist
       SET Status = 'Claimed'
       WHERE CustomerID = ?
         AND ExhibitionID = ?
         AND Status IN ('Waiting', 'Notified')`,
      [customerId, order.ExhibitionID]
    );

    await connection.commit();

    return {
      status: 201,
      data: {
        count: order.Count,
        total: money(total),
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


async function joinWaitlist(params, body, customerId) {
  await findCustomer(customerId);
  const exhibitionID = checkPositiveId(body.ExhibitionID, "exhibition");

  if (!ticketTypes.includes(body.TicketType)) {
    throw makeError(400, "Please select a valid ticket type");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [exhibitions] = await connection.query(
      `SELECT e.ExhibitionID, e.Capacity
       FROM exhibition e
       WHERE e.ExhibitionID = ?
         AND ${openExhibition}
       FOR UPDATE`,
      [exhibitionID]
    );

    if (exhibitions.length === 0) {
      throw makeError(400, "That exhibition is not open for tickets");
    }

    const sold = await countSold(connection, exhibitionID);

    if (sold < Number(exhibitions[0].Capacity)) {
      throw makeError(400, "Tickets are still available for this exhibition");
    }

    const [waiting] = await connection.query(
      `SELECT WaitlistID
       FROM waitlist
       WHERE CustomerID = ?
         AND ExhibitionID = ?
         AND Status IN ('Waiting', 'Notified')`,
      [customerId, exhibitionID]
    );

    if (waiting.length > 0) {
      throw makeError(409, "You are already on the waitlist for this exhibition");
    }

    await connection.query(
      `INSERT INTO waitlist
        (ExhibitionID, CustomerID, TicketType, CreatedAt, CreatedBy)
       VALUES (?, ?, ?, NOW(), NULL)`,
      [exhibitionID, customerId, body.TicketType]
    );

    await connection.commit();

    return {
      status: 201,
      data: { message: "You are on the waitlist" },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function leaveWaitlist(params, body, customerId) {
  await findCustomer(customerId);
  const waitlistID = checkPositiveId(body.WaitlistID, "waitlist entry");

  const [result] = await pool.query(
    `UPDATE waitlist
     SET Status = 'Cancelled'
     WHERE WaitlistID = ?
       AND CustomerID = ?
       AND Status IN ('Waiting', 'Notified')`,
    [waitlistID, customerId]
  );

  if (result.affectedRows === 0) {
    throw makeError(404, "Waitlist entry not found");
  }

  return {
    status: 200,
    data: { message: "You left the waitlist" },
  };
}

async function getShop() {
  const [rows] = await pool.query(
    `SELECT ItemID, ItemName, Category, Price, Stock
     FROM giftshop
     WHERE IsDeleted = 0
     ORDER BY ItemName`
  );

  return {
    status: 200,
    data: rows.map((item) => ({
      ...item,
      ItemID: Number(item.ItemID),
      Price: Number(item.Price),
      Stock: Number(item.Stock),
    })),
  };
}

function checkShopOrder(body) {
  if (!onlinePayments.includes(body.PaymentMethod)) {
    throw makeError(400, "Please select a valid payment method");
  }

  if (!Array.isArray(body.Items) || body.Items.length === 0) {
    throw makeError(400, "Your cart is empty");
  }

  const items = [];

  for (const line of body.Items) {
    if (typeof line !== "object" || line === null) {
      throw makeError(400, "Please select a valid item");
    }

    const itemID = checkPositiveId(line.ItemID, "item");
    const quantity = Number(line.Quantity);

    if (
      line.Quantity === "" ||
      line.Quantity === null ||
      line.Quantity === undefined ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > maxPerOrder
    ) {
      throw makeError(
        400,
        `Quantity must be between 1 and ${maxPerOrder}`
      );
    }

    if (items.some((item) => item.ItemID === itemID)) {
      throw makeError(400, "Each item can only appear once in an order");
    }

    items.push({ ItemID: itemID, Quantity: quantity });
  }

  items.sort((a, b) => a.ItemID - b.ItemID);

  return {
    PaymentMethod: body.PaymentMethod,
    Items: items,
  };
}

async function addShopOrder(params, body, customerId) {
  await findCustomer(customerId);
  const order = checkShopOrder(body);
  const membership = await findMembership(customerId);
  const membershipID = getActiveMembershipID(membership);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let total = 0;

    for (const line of order.Items) {
      const [items] = await connection.query(
        `SELECT ItemID, ItemName, Price, Stock, StaffID
         FROM giftshop
         WHERE ItemID = ? AND IsDeleted = 0
         FOR UPDATE`,
        [line.ItemID]
      );

      if (items.length === 0) {
        throw makeError(400, "One of the items no longer exists");
      }

      const item = items[0];

      if (line.Quantity > Number(item.Stock)) {
        throw makeError(400, `Not enough stock for ${item.ItemName}`);
      }

      await connection.query(
        `INSERT INTO giftshopsale
          (ItemID, SalePrice, Quantity, StaffID, SaleDate,
           PaymentMethod, CreatedAt, UpdatedAt, CreatedBy,
           IsDeleted, MembershipID, CustomerID)
         VALUES (?, ?, ?, ?, CURDATE(), ?, NOW(), NOW(), NULL, 0, ?, ?)`,
        [
          line.ItemID,
          Number(item.Price),
          line.Quantity,
          item.StaffID,
          order.PaymentMethod,
          membershipID,
          customerId,
        ]
      );

      total = total + Number(item.Price) * line.Quantity;
    }

    await connection.commit();

    return {
      status: 201,
      data: { total: money(total) },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = [
  {
    method: "POST",
    path: "/api/customer/register",
    handler: registerCustomer,
  },
  {
    method: "POST",
    path: "/api/customer/login",
    handler: loginCustomer,
  },
  {
    method: "POST",
    path: "/api/customer/logout",
    handler: logoutCustomer,
    needsCustomer: true,
  },
  {
    method: "GET",
    path: "/api/customer/account",
    handler: getAccount,
    needsCustomer: true,
  },
  {
    method: "POST",
    path: "/api/customer/membership/cancel",
    handler: cancelMembership,
    needsCustomer: true,
  },
  {
    method: "POST",
    path: "/api/customer/membership/renew",
    handler: renewMembership,
    needsCustomer: true,
  },
  {
    method: "GET",
    path: "/api/customer/purchases",
    handler: getPurchases,
    needsCustomer: true,
  },
  {
    method: "GET",
    path: "/api/customer/alerts",
    handler: getMyAlerts,
    needsCustomer: true,
  },
  {
    method: "GET",
    path: "/api/customer/exhibitions",
    handler: getExhibitions,
    needsCustomer: true,
  },
  {
    method: "POST",
    path: "/api/customer/tickets",
    handler: addTickets,
    needsCustomer: true,
  },
  {
    method: "POST",
    path: "/api/customer/waitlist",
    handler: joinWaitlist,
    needsCustomer: true,
  },
  {
    method: "POST",
    path: "/api/customer/waitlist/leave",
    handler: leaveWaitlist,
    needsCustomer: true,
  },
  {
    method: "GET",
    path: "/api/customer/shop",
    handler: getShop,
    needsCustomer: true,
  },
  {
    method: "POST",
    path: "/api/customer/shop/orders",
    handler: addShopOrder,
    needsCustomer: true,
  },
];
