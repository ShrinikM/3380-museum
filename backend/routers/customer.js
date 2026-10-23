const pool = require("../db");
const { ticketPrices, ticketTypes } = require("../prices");

// Customers pay online, so cash is not offered
const onlinePayments = ["Credit Card", "Debit Card", "Mobile Pay"];
const maxPerOrder = 20;

function makeError(status, message){
  const error = new Error(message);
  error.status = status;
  return error;
}

function money(value){
  return Number(Number(value).toFixed(2));
}

function checkQuantity(value, label){
  const quantity = Number(value);

  if(!Number.isSafeInteger(quantity) || quantity < 0 || quantity > maxPerOrder){
    throw makeError(400, `${label} must be a whole number from 0 to ${maxPerOrder}`);
  }

  return quantity;
}

function checkId(value, label){
  const id = Number(value);

  if(!Number.isSafeInteger(id) || id < 1){
    throw makeError(400, `Please select a valid ${label}`);
  }

  return id;
}

// Passwords may be stored as bcrypt hashes or, for demo accounts, as plain text
async function passwordMatches(password, stored){
  if(stored.startsWith("$2")){
    const bcrypt = require("bcrypt");
    return bcrypt.compare(password, stored);
  }

  return password === stored;
}

// Discount only applies while the membership is active
async function getDiscount(connection, membershipId){
  const [rows] = await connection.query(
    `SELECT DiscountPercent
     FROM membership
     WHERE MembershipID = ?
       AND IsDeleted = 0
       AND CURDATE() BETWEEN StartDate AND EndDate`,
    [membershipId]
  );

  return rows.length === 0 ? 0 : Number(rows[0].DiscountPercent);
}

// POST /api/customer/login
async function login(params, body){
  const username = typeof body.Username === "string" ? body.Username.trim() : "";
  const password = typeof body.Password === "string" ? body.Password : "";

  if(username === "" || password === ""){
    throw makeError(400, "Enter your username and password");
  }

  const [rows] = await pool.query(
    `SELECT c.Password, m.FirstName, m.LastName
     FROM customercredentials c
     JOIN membership m
       ON m.MembershipID = c.MembershipID
       AND m.IsDeleted = 0
     WHERE c.Username = ?`,
    [username]
  );

  if(rows.length === 0 || !(await passwordMatches(password, rows[0].Password))){
    throw makeError(401, "Wrong username or password.");
  }

  return {
    status: 200,
    data: {
      username: username,
      role: "Customer",
      name: rows[0].FirstName + " " + rows[0].LastName,
    },
  };
}

// GET /api/customer/account: membership, tickets and gift shop orders
async function getAccount(params, body, membershipId){
  const [members] = await pool.query(
    `SELECT
       MembershipID,
       FirstName,
       LastName,
       Email,
       Phone,
       MembershipType,
       DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
       DiscountPercent,
       CASE
         WHEN EndDate < CURDATE() THEN 'expired'
         WHEN StartDate > CURDATE() THEN 'upcoming'
         ELSE 'active'
       END AS Status
     FROM membership
     WHERE MembershipID = ? AND IsDeleted = 0`,
    [membershipId]
  );

  const [tickets] = await pool.query(
    `SELECT
       t.TicketID,
       t.TicketType,
       t.Price,
       DATE_FORMAT(t.SaleDate, '%Y-%m-%d') AS SaleDate,
       e.Name AS ExhibitionName,
       DATE_FORMAT(e.EndDate, '%Y-%m-%d') AS ExhibitionEndDate
     FROM ticket t
     JOIN exhibition e ON e.ExhibitionID = t.ExhibitionID
     WHERE t.MembershipID = ? AND t.IsDeleted = 0
     ORDER BY t.SaleDate DESC, t.TicketID DESC`,
    [membershipId]
  );

  const [orders] = await pool.query(
    `SELECT
       s.SaleID,
       g.ItemName,
       s.Quantity,
       s.SalePrice,
       DATE_FORMAT(s.SaleDate, '%Y-%m-%d') AS SaleDate,
       s.PaymentMethod
     FROM giftshopsale s
     JOIN giftshop g ON g.ItemID = s.ItemID
     WHERE s.MembershipID = ? AND s.IsDeleted = 0
     ORDER BY s.SaleDate DESC, s.SaleID DESC`,
    [membershipId]
  );

  const member = members[0];

  return {
    status: 200,
    data: {
      membership: {
        ...member,
        MembershipID: Number(member.MembershipID),
        DiscountPercent: Number(member.DiscountPercent),
      },
      tickets: tickets.map((ticket)=>({
        ...ticket,
        TicketID: Number(ticket.TicketID),
        Price: Number(ticket.Price),
      })),
      orders: orders.map((order)=>({
        ...order,
        SaleID: Number(order.SaleID),
        Quantity: Number(order.Quantity),
        SalePrice: Number(order.SalePrice),
        Total: money(order.SalePrice * order.Quantity),
      })),
    },
  };
}

// GET /api/customer/exhibitions: exhibitions open today, with prices
async function getExhibitions(params, body, membershipId){
  // Counts every ticket row, the same way the capacity trigger does
  const [rows] = await pool.query(
    `SELECT
       e.ExhibitionID,
       e.Name,
       e.Description,
       DATE_FORMAT(e.StartDate, '%Y-%m-%d') AS StartDate,
       DATE_FORMAT(e.EndDate, '%Y-%m-%d') AS EndDate,
       e.Capacity,
       (SELECT COUNT(*) FROM ticket t WHERE t.ExhibitionID = e.ExhibitionID) AS Sold
     FROM exhibition e
     WHERE e.IsDeleted = 0
       AND CURDATE() BETWEEN e.StartDate AND e.EndDate
     ORDER BY e.EndDate, e.Name`
  );

  return {
    status: 200,
    data: {
      prices: ticketPrices,
      discount: await getDiscount(pool, membershipId),
      exhibitions: rows.map((row)=>({
        ExhibitionID: Number(row.ExhibitionID),
        Name: row.Name,
        Description: row.Description,
        StartDate: row.StartDate,
        EndDate: row.EndDate,
        Remaining: Math.max(Number(row.Capacity) - Number(row.Sold), 0),
      })),
    },
  };
}

// POST /api/customer/tickets
// Body: { ExhibitionID, Tickets: { Adult: 2, Child: 1 } }
async function buyTickets(params, body, membershipId){
  const exhibitionId = checkId(body.ExhibitionID, "exhibition");
  const counts = body.Tickets && typeof body.Tickets === "object" ? body.Tickets : {};

  const wanted = ticketTypes
    .map((type)=>({ type: type, quantity: checkQuantity(counts[type] ?? 0, type + " tickets") }))
    .filter((row)=>row.quantity > 0);

  const total = wanted.reduce((sum, row)=>sum + row.quantity, 0);

  if(total === 0){
    throw makeError(400, "Choose at least one ticket");
  }

  if(total > maxPerOrder){
    throw makeError(400, `You can buy up to ${maxPerOrder} tickets at a time`);
  }

  const connection = await pool.getConnection();

  try{
    await connection.beginTransaction();

    // Lock the exhibition so two orders cannot oversell it
    const [exhibitions] = await connection.query(
      `SELECT ExhibitionID, Capacity
       FROM exhibition
       WHERE ExhibitionID = ?
         AND IsDeleted = 0
         AND CURDATE() BETWEEN StartDate AND EndDate
       FOR UPDATE`,
      [exhibitionId]
    );

    if(exhibitions.length === 0){
      throw makeError(400, "This exhibition is not open right now");
    }

    const [sold] = await connection.query(
      "SELECT COUNT(*) AS Sold FROM ticket WHERE ExhibitionID = ?",
      [exhibitionId]
    );

    const remaining = Number(exhibitions[0].Capacity) - Number(sold[0].Sold);

    if(total > remaining){
      throw makeError(400, remaining > 0
        ? `Only ${remaining} tickets are left for this exhibition`
        : "This exhibition is sold out");
    }

    const discount = await getDiscount(connection, membershipId);
    const values = [];

    for(const row of wanted){
      const price = money(ticketPrices[row.type] * (1 - discount / 100));

      for(let i = 0; i < row.quantity; i++){
        values.push([row.type, price, exhibitionId, membershipId]);
      }
    }

    // Inserted one at a time so the capacity trigger checks each ticket
    for(const value of values){
      await connection.query(
        `INSERT INTO ticket
          (TicketType, Price, SaleDate, ExhibitionID, MembershipID,
           CreatedAt, UpdatedAt, CreatedBy, IsDeleted)
         VALUES (?, ?, CURDATE(), ?, ?, NOW(), NOW(), NULL, 0)`,
        value
      );
    }

    await connection.commit();

    return {
      status: 201,
      data: {
        count: values.length,
        total: money(values.reduce((sum, value)=>sum + value[1], 0)),
      },
    };
  }
  catch(error){
    await connection.rollback();
    throw error;
  }
  finally{
    connection.release();
  }
}

// GET /api/customer/shop: gift shop items
async function getShopItems(){
  const [rows] = await pool.query(
    `SELECT ItemID, ItemName, Category, Price, Stock
     FROM giftshop
     WHERE IsDeleted = 0
     ORDER BY Category, ItemName`
  );

  return {
    status: 200,
    data: rows.map((item)=>({
      ...item,
      ItemID: Number(item.ItemID),
      Price: Number(item.Price),
      Stock: Number(item.Stock),
    })),
  };
}

// POST /api/customer/shop/orders
// Body: { Items: [{ ItemID, Quantity }], PaymentMethod }
async function buyGifts(params, body, membershipId){
  if(!onlinePayments.includes(body.PaymentMethod)){
    throw makeError(400, "Please choose a payment method");
  }

  if(!Array.isArray(body.Items) || body.Items.length === 0){
    throw makeError(400, "Your cart is empty");
  }

  // Combine repeated items into one line each
  const cart = new Map();

  for(const line of body.Items){
    const itemId = checkId(line.ItemID, "item");
    const quantity = checkQuantity(line.Quantity, "Quantity");

    if(quantity > 0){
      cart.set(itemId, (cart.get(itemId) || 0) + quantity);
    }
  }

  if(cart.size === 0){
    throw makeError(400, "Your cart is empty");
  }

  const connection = await pool.getConnection();

  try{
    await connection.beginTransaction();

    const [items] = await connection.query(
      `SELECT ItemID, ItemName, Price, Stock, StaffID
       FROM giftshop
       WHERE ItemID IN (?) AND IsDeleted = 0
       FOR UPDATE`,
      [[...cart.keys()]]
    );

    if(items.length !== cart.size){
      throw makeError(400, "One of the items is no longer available");
    }

    let total = 0;

    for(const item of items){
      const quantity = cart.get(Number(item.ItemID));

      if(quantity > Number(item.Stock)){
        throw makeError(400, `Only ${item.Stock} left of ${item.ItemName}`);
      }

      // Online sales are recorded under the staff member who manages the item.
      // The stock trigger lowers Stock automatically.
      await connection.query(
        `INSERT INTO giftshopsale
          (ItemID, SalePrice, Quantity, StaffID, SaleDate, PaymentMethod,
           CreatedAt, UpdatedAt, CreatedBy, IsDeleted, MembershipID)
         VALUES (?, ?, ?, ?, CURDATE(), ?, NOW(), NOW(), NULL, 0, ?)`,
        [item.ItemID, item.Price, quantity, item.StaffID, body.PaymentMethod, membershipId]
      );

      total += Number(item.Price) * quantity;
    }

    await connection.commit();

    return {
      status: 201,
      data: { total: money(total) },
    };
  }
  catch(error){
    await connection.rollback();
    throw error;
  }
  finally{
    connection.release();
  }
}

module.exports = [
  { method: "POST", path: "/api/customer/login", handler: login },
  { method: "GET", path: "/api/customer/account", handler: getAccount, needsCustomer: true },
  { method: "GET", path: "/api/customer/exhibitions", handler: getExhibitions, needsCustomer: true },
  { method: "POST", path: "/api/customer/tickets", handler: buyTickets, needsCustomer: true },
  { method: "GET", path: "/api/customer/shop", handler: getShopItems, needsCustomer: true },
  { method: "POST", path: "/api/customer/shop/orders", handler: buyGifts, needsCustomer: true },
];