const pool = require("../db");
const {
  ticketPrices,
  ticketTypes,
  membershipPlans,
  membershipTypes,
} = require("../prices");
const { joinCurrentTerm, termStatus } = require("../terms");

const onlinePayments = ["Credit Card", "Debit Card", "Mobile Pay"];

const membershipPayments = ["Credit Card", "Debit Card"];

const maxPerOrder = 20;

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

async function findCustomer(staffId) {
  const [rows] = await pool.query(
    `SELECT StaffID, Email, PhoneNumber
     FROM staff
     WHERE StaffID = ?
       AND IsDeleted = 0
       AND Role = 'Customer'`,
    [staffId]
  );

  if (rows.length === 0) {
    throw makeError(403, "Only customer accounts can use this page");
  }

  return rows[0];
}

async function findMembership(customer) {
  const phone = onlyDigits(customer.PhoneNumber);

  const [rows] = await pool.query(
    `SELECT
       m.MembershipID,
       m.FirstName,
       m.LastName,
       m.Email,
       m.Phone,
       term.TermID,
       term.MembershipType,
       DATE_FORMAT(term.StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(term.EndDate, '%Y-%m-%d') AS EndDate,
       term.DiscountPercent,
       ${termStatus} AS Status
     FROM membership m
     ${joinCurrentTerm("m")}
     WHERE m.IsDeleted = 0
       AND (LOWER(m.Email) = LOWER(?) OR m.Phone = ?)
     LIMIT 1`,
    [customer.Email, phone.length >= 10 ? phone : null]
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

function getActiveMembershipID(membership) {
  if (membership !== null && membership.Status === "active") {
    return membership.MembershipID;
  }

  return null;
}

async function getAccount(params, body, staffId) {
  const customer = await findCustomer(staffId);
  const membership = await findMembership(customer);

  return {
    status: 200,
    data: {
      membership: membership,
      terms: membership === null ? [] : await findTerms(membership.MembershipID),
      plans: membershipTypes.map((type) => ({
        MembershipType: type,
        ...membershipPlans[type],
      })),
    },
  };
}

async function cancelMembership(params, body, staffId) {
  const customer = await findCustomer(staffId);
  const membership = await findMembership(customer);

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

async function renewMembership(params, body, staffId) {
  const customer = await findCustomer(staffId);
  const renewal = checkRenewal(body);
  const membership = await findMembership(customer);

  if (membership === null) {
    throw makeError(404, "You do not have a membership to renew");
  }

  if (
    membership.Status === "active" &&
    membership.MembershipType === renewal.MembershipType
  ) {
    throw makeError(400, `You are already on the ${renewal.MembershipType} plan`);
  }

  const plan = membershipPlans[renewal.MembershipType];
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE membershipterm
       SET CancelledAt = NOW()
       WHERE MembershipID = ?
         AND CancelledAt IS NULL
         AND EndDate >= CURDATE()`,
      [membership.MembershipID]
    );

    await connection.query(
      `INSERT INTO membershipterm
        (MembershipID, MembershipType, StartDate, EndDate, Price,
         DiscountPercent, PaymentMethod, CreatedAt, CreatedBy)
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
               ?, ?, ?, NOW(), ?)`,
      [
        membership.MembershipID,
        renewal.MembershipType,
        plan.Price,
        plan.DiscountPercent,
        renewal.PaymentMethod,
        staffId,
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

async function getPurchases(params, body, staffId) {
  await findCustomer(staffId);

  const [tickets] = await pool.query(
    `SELECT
       t.TicketID,
       e.Name AS ExhibitionName,
       t.TicketType,
       t.Price,
       DATE_FORMAT(t.SaleDate, '%Y-%m-%d') AS SaleDate
     FROM ticket t
     JOIN exhibition e
       ON e.ExhibitionID = t.ExhibitionID
     WHERE t.IsDeleted = 0
       AND t.CreatedBy = ?
     ORDER BY t.SaleDate DESC, t.TicketID DESC`,
    [staffId]
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
       AND s.CreatedBy = ?
     ORDER BY s.SaleDate DESC, s.SaleID DESC`,
    [staffId]
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
    },
  };
}

async function getExhibitions(params, body, staffId) {
  const customer = await findCustomer(staffId);
  const membership = await findMembership(customer);

  const [rows] = await pool.query(
    `SELECT
       e.ExhibitionID,
       e.Name,
       e.Description,
       DATE_FORMAT(e.EndDate, '%Y-%m-%d') AS EndDate,
       GREATEST(
         e.Capacity - (
           SELECT COUNT(*)
           FROM ticket t
           WHERE t.ExhibitionID = e.ExhibitionID
             AND t.IsDeleted = 0
         ),
         0
       ) AS Remaining
     FROM exhibition e
     WHERE e.IsDeleted = 0
       AND e.StartDate <= CURDATE()
       AND e.EndDate >= CURDATE()
     ORDER BY e.EndDate, e.Name`
  );

  return {
    status: 200,
    data: {
      exhibitions: rows.map((exhibition) => ({
        ...exhibition,
        ExhibitionID: Number(exhibition.ExhibitionID),
        Remaining: Number(exhibition.Remaining),
      })),
      prices: ticketPrices,
      discount: getDiscount(membership),
    },
  };
}

function checkTicketOrder(body) {
  const exhibitionID = checkPositiveId(body.ExhibitionID, "exhibition");

  if (
    typeof body.Tickets !== "object" ||
    body.Tickets === null ||
    Array.isArray(body.Tickets)
  ) {
    throw makeError(400, "Please choose at least one ticket");
  }

  const counts = {};
  let total = 0;

  for (const type of Object.keys(body.Tickets)) {
    if (!ticketTypes.includes(type)) {
      throw makeError(400, "Please select a valid ticket type");
    }

    const count = Number(body.Tickets[type]);

    if (!Number.isSafeInteger(count) || count < 0) {
      throw makeError(400, "Ticket quantities must be whole numbers");
    }

    if (count > 0) {
      counts[type] = count;
      total = total + count;
    }
  }

  if (total === 0) {
    throw makeError(400, "Please choose at least one ticket");
  }

  if (total > maxPerOrder) {
    throw makeError(
      400,
      `You can buy up to ${maxPerOrder} tickets at a time`
    );
  }

  return {
    ExhibitionID: exhibitionID,
    Counts: counts,
    Count: total,
  };
}

async function addTickets(params, body, staffId) {
  const customer = await findCustomer(staffId);
  const order = checkTicketOrder(body);
  const membership = await findMembership(customer);
  const discount = getDiscount(membership);
  const membershipID = getActiveMembershipID(membership);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [exhibitions] = await connection.query(
      `SELECT ExhibitionID, Capacity
       FROM exhibition
       WHERE ExhibitionID = ?
         AND IsDeleted = 0
         AND StartDate <= CURDATE()
         AND EndDate >= CURDATE()
       FOR UPDATE`,
      [order.ExhibitionID]
    );

    if (exhibitions.length === 0) {
      throw makeError(400, "That exhibition is not open for tickets");
    }

    const [sold] = await connection.query(
      `SELECT COUNT(*) AS Total
       FROM ticket
       WHERE ExhibitionID = ? AND IsDeleted = 0`,
      [order.ExhibitionID]
    );

    const remaining = Number(exhibitions[0].Capacity) - Number(sold[0].Total);

    if (order.Count > remaining) {
      throw makeError(400, "Not enough tickets left for this exhibition");
    }

    let total = 0;

    for (const type of Object.keys(order.Counts)) {
      const price = money(ticketPrices[type] * (1 - discount / 100));

      for (let i = 0; i < order.Counts[type]; i++) {
        await connection.query(
          `INSERT INTO ticket
            (TicketType, Price, SaleDate, ExhibitionID, MembershipID,
             CreatedAt, UpdatedAt, CreatedBy, IsDeleted)
           VALUES (?, ?, CURDATE(), ?, ?, NOW(), NOW(), ?, 0)`,
          [type, price, order.ExhibitionID, membershipID, staffId]
        );

        total = total + price;
      }
    }

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

async function addShopOrder(params, body, staffId) {
  const customer = await findCustomer(staffId);
  const order = checkShopOrder(body);
  const membership = await findMembership(customer);
  const membershipID = getActiveMembershipID(membership);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let total = 0;

    for (const line of order.Items) {
      const [items] = await connection.query(
        `SELECT ItemID, ItemName, Price, Stock
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
           IsDeleted, MembershipID)
         VALUES (?, ?, ?, ?, CURDATE(), ?, NOW(), NOW(), ?, 0, ?)`,
        [
          line.ItemID,
          Number(item.Price),
          line.Quantity,
          staffId,
          order.PaymentMethod,
          staffId,
          membershipID,
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
    method: "GET",
    path: "/api/customer/account",
    handler: getAccount,
    needsActor: true,
  },
  {
    method: "POST",
    path: "/api/customer/membership/cancel",
    handler: cancelMembership,
    needsActor: true,
  },
  {
    method: "POST",
    path: "/api/customer/membership/renew",
    handler: renewMembership,
    needsActor: true,
  },
  {
    method: "GET",
    path: "/api/customer/purchases",
    handler: getPurchases,
    needsActor: true,
  },
  {
    method: "GET",
    path: "/api/customer/exhibitions",
    handler: getExhibitions,
    needsActor: true,
  },
  {
    method: "POST",
    path: "/api/customer/tickets",
    handler: addTickets,
    needsActor: true,
  },
  {
    method: "GET",
    path: "/api/customer/shop",
    handler: getShop,
    needsActor: true,
  },
  {
    method: "POST",
    path: "/api/customer/shop/orders",
    handler: addShopOrder,
    needsActor: true,
  },
];
