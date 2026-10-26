
const pool = require("../db");
const { membershipPlans } = require("../prices");
const { joinCurrentTerm, activeTerm } = require("../terms");

const storeTypes = {
  giftshop: {
    itemTable: "giftshop",
    saleTable: "giftshopsale",
    role: ["Staff", "Admin"],
    buyer: "COALESCE(sale.CustomerID, member.CustomerID)",
  },
  cafe: {
    itemTable: "cafe",
    saleTable: "cafesale",
    role: "Cafe",
    buyer: "member.CustomerID",
  },
};

const paymentMethods = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Mobile Pay",
];

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getStore(kind) {
  if (!storeTypes[kind]) {
    throw makeError(400, "Invalid store type");
  }
  return storeTypes[kind];
}

function checkId(params) {
  const id = Number(params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw makeError(400, "ID must be a positive integer");
  }

  return id;
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

function checkDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw makeError(400, "SaleDate must use YYYY-MM-DD format");
  }

  const date = new Date(value + "T00:00:00.000Z");

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw makeError(400, "SaleDate must be a valid date");
  }

  if (value > new Date().toISOString().slice(0, 10)) {
    throw makeError(400, "SaleDate cannot be in the future");
  }

  return value;
}

function checkItem(body, kind) {
  if (
    typeof body.ItemName !== "string" ||
    !body.ItemName.trim() ||
    typeof body.Category !== "string" ||
    !body.Category.trim()
  ) {
    throw makeError(400, "ItemName and Category are required");
  }

  const price = Number(body.Price);

  if (!Number.isFinite(price) || price <= 0) {
    throw makeError(400, "Price must be greater than zero");
  }

  const item = {
    ItemName: body.ItemName.trim(),
    Category: body.Category.trim(),
    Price: Number(price.toFixed(2)),
    StaffID: checkPositiveId(body.StaffID, "staff member"),
  };

  if (kind === "giftshop") {
    const stock = Number(body.Stock);

    if (
      body.Stock === "" ||
      body.Stock === null ||
      body.Stock === undefined ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      throw makeError(400, "Stock must be a nonnegative integer");
    }

    item.Stock = stock;
  }

  return item;
}

function checkSale(body) {
  const itemID = checkPositiveId(body.ItemID, "item");
  const staffID = checkPositiveId(body.StaffID, "staff member");
  const quantity = Number(body.Quantity);

  if (
    body.Quantity === "" ||
    body.Quantity === null ||
    body.Quantity === undefined ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  ) {
    throw makeError(400, "Quantity must be a positive integer");
  }

  if (!paymentMethods.includes(body.PaymentMethod)) {
    throw makeError(400, "Please select a valid payment method");
  }

  const sale = {
    ItemID: itemID,
    StaffID: staffID,
    Quantity: quantity,
    SaleDate: checkDate(body.SaleDate),
    PaymentMethod: body.PaymentMethod,
    MembershipID: null,
  };

  if (
    body.MembershipID !== "" &&
    body.MembershipID !== null &&
    body.MembershipID !== undefined
  ) {
    sale.MembershipID = checkPositiveId(
      body.MembershipID,
      "membership"
    );
  }

  return sale;
}

async function checkStaff(connection, staffID, kind) {
  const role = getStore(kind).role;
  const roles = Array.isArray(role) ? role : [role];

  const [rows] = await connection.query(
    `SELECT StaffID
     FROM staff
     WHERE StaffID = ?
       AND IsDeleted = 0
       AND Role IN (?)`,
    [staffID, roles]
  );

  if (rows.length === 0) {
    throw makeError(
      400,
      `Select an active staff member with a valid role.`
    );
  }
}

function storeSalePrice(basePrice, membershipType, kind) {
  const plan = membershipPlans[membershipType];

  if (!plan) {
    return Number(Number(basePrice).toFixed(2));
  }

  const percent =
    kind === "giftshop"
      ? Number(plan.GiftShopDiscount)
      : Number(plan.CafeDiscount);

  return Number((Number(basePrice) * (1 - percent / 100)).toFixed(2));
}

async function checkMembership(connection, membershipID) {
  if (membershipID === null) {
    return null;
  }

  const [rows] = await connection.query(
    `SELECT m.MembershipID, m.CustomerID, term.MembershipType
     FROM membership m
     ${joinCurrentTerm("m")}
     WHERE m.MembershipID = ?
       AND m.IsDeleted = 0
       AND ${activeTerm}`,
    [membershipID]
  );

  if (rows.length === 0) {
    throw makeError(
      400,
      "The selected membership is not active or does not exist"
    );
  }

  return {
    CustomerID: Number(rows[0].CustomerID),
    MembershipType: rows[0].MembershipType,
  };
}

async function findItem(id, kind) {
  const store = getStore(kind);
  const stockColumn = kind === "giftshop" ? ", i.Stock" : "";

  const [rows] = await pool.query(
    `SELECT
       i.ItemID, i.ItemName, i.Category, i.StaffID,
       CONCAT(s.FirstName, ' ', s.LastName) AS StaffName,
       i.Price ${stockColumn}
     FROM ${store.itemTable} i
     JOIN staff s ON s.StaffID = i.StaffID
     WHERE i.ItemID = ? AND i.IsDeleted = 0`,
    [id]
  );

  if (rows.length === 0) return null;

  const item = rows[0];

  return {
    ...item,
    ItemID: Number(item.ItemID),
    StaffID: Number(item.StaffID),
    Price: Number(item.Price),
    ...(kind === "giftshop" ? { Stock: Number(item.Stock) } : {}),
  };
}

async function findSale(id, kind) {
  const store = getStore(kind);

  const [rows] = await pool.query(
    `SELECT
       sale.SaleID,
       sale.ItemID,
       item.ItemName,
       sale.SalePrice,
       sale.Quantity,
       DATE_FORMAT(sale.SaleDate, '%Y-%m-%d') AS SaleDate,
       sale.PaymentMethod,
       sale.StaffID,
       CONCAT(staff.FirstName, ' ', staff.LastName) AS StaffName,
       sale.MembershipID,
       CONCAT(buyer.FirstName, ' ', buyer.LastName) AS CustomerName
     FROM ${store.saleTable} sale
     JOIN ${store.itemTable} item ON item.ItemID = sale.ItemID
     JOIN staff ON staff.StaffID = sale.StaffID
     LEFT JOIN membership member
       ON member.MembershipID = sale.MembershipID
     LEFT JOIN customer buyer
       ON buyer.CustomerID = ${store.buyer}
     WHERE sale.SaleID = ? AND sale.IsDeleted = 0`,
    [id]
  );

  if (rows.length === 0) return null;

  const sale = rows[0];

  return {
    ...sale,
    SaleID: Number(sale.SaleID),
    ItemID: Number(sale.ItemID),
    SalePrice: Number(sale.SalePrice),
    Quantity: Number(sale.Quantity),
    StaffID: Number(sale.StaffID),
    MembershipID:
      sale.MembershipID === null ? null : Number(sale.MembershipID),
  };
}

// GET ITEMS
async function getItems(params, body, kind) {
  const store = getStore(kind);
  const stockColumn = kind === "giftshop" ? ", i.Stock" : "";

  const [rows] = await pool.query(
    `SELECT
       i.ItemID, i.ItemName, i.Category, i.StaffID,
       CONCAT(s.FirstName, ' ', s.LastName) AS StaffName,
       i.Price ${stockColumn}
     FROM ${store.itemTable} i
     JOIN staff s ON s.StaffID = i.StaffID
     WHERE i.IsDeleted = 0
     ORDER BY i.ItemName`
  );

  return {
    status: 200,
    data: rows.map((item) => ({
      ...item,
      ItemID: Number(item.ItemID),
      StaffID: Number(item.StaffID),
      Price: Number(item.Price),
      ...(kind === "giftshop" ? { Stock: Number(item.Stock) } : {}),
    })),
  };
}

// GET SALES
async function getSales(params, body, kind) {
  const store = getStore(kind);

  const [rows] = await pool.query(
    `SELECT
       sale.SaleID, sale.ItemID, item.ItemName,
       sale.SalePrice, sale.Quantity,
       DATE_FORMAT(sale.SaleDate, '%Y-%m-%d') AS SaleDate,
       sale.PaymentMethod, sale.StaffID,
       CONCAT(staff.FirstName, ' ', staff.LastName) AS StaffName,
       sale.MembershipID,
       CONCAT(buyer.FirstName, ' ', buyer.LastName) AS CustomerName
     FROM ${store.saleTable} sale
     JOIN ${store.itemTable} item ON item.ItemID = sale.ItemID
     JOIN staff ON staff.StaffID = sale.StaffID
     LEFT JOIN membership member
       ON member.MembershipID = sale.MembershipID
     LEFT JOIN customer buyer
       ON buyer.CustomerID = ${store.buyer}
     WHERE sale.IsDeleted = 0
     ORDER BY sale.SaleDate DESC, sale.SaleID DESC`
  );

  return {
    status: 200,
    data: rows.map((sale) => ({
      ...sale,
      SaleID: Number(sale.SaleID),
      ItemID: Number(sale.ItemID),
      SalePrice: Number(sale.SalePrice),
      Quantity: Number(sale.Quantity),
      StaffID: Number(sale.StaffID),
      MembershipID:
        sale.MembershipID === null ? null : Number(sale.MembershipID),
    })),
  };
}


async function addItem(params, body, kind) {
  const store = getStore(kind);
  const item = checkItem(body, kind);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await checkStaff(connection, item.StaffID, kind);

    const [result] = await connection.query(
      `INSERT INTO ${store.itemTable}
       (ItemName, Category, StaffID, Price,
        CreatedAt, UpdatedAt, CreatedBy, IsDeleted
        ${kind === "giftshop" ? ", Stock" : ""})
       VALUES (?, ?, ?, ?, NOW(), NOW(), NULL, 0
        ${kind === "giftshop" ? ", ?" : ""})`,
      [
        item.ItemName,
        item.Category,
        item.StaffID,
        item.Price,
        ...(kind === "giftshop" ? [item.Stock] : []),
      ]
    );

    await connection.commit();

    return {
      status: 201,
      data: await findItem(result.insertId, kind),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


async function updateItem(params, body, kind) {
  const id = checkId(params);
  const store = getStore(kind);
  const item = checkItem(body, kind);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT ItemID FROM ${store.itemTable}
       WHERE ItemID = ? AND IsDeleted = 0 FOR UPDATE`,
      [id]
    );

    if (existing.length === 0) {
      throw makeError(404, "Item not found");
    }

    await checkStaff(connection, item.StaffID, kind);

    await connection.query(
      `UPDATE ${store.itemTable}
       SET ItemName = ?, Category = ?, StaffID = ?, Price = ?,
           UpdatedAt = NOW()
           ${kind === "giftshop" ? ", Stock = ?" : ""}
       WHERE ItemID = ? AND IsDeleted = 0`,
      [
        item.ItemName,
        item.Category,
        item.StaffID,
        item.Price,
        ...(kind === "giftshop" ? [item.Stock] : []),
        id,
      ]
    );

    await connection.commit();

    return {
      status: 200,
      data: await findItem(id, kind),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// SOFT-DELETE ITEM
async function deleteItem(params, body, kind) {
  const id = checkId(params);
  const store = getStore(kind);

  const [sales] = await pool.query(
    `SELECT SaleID FROM ${store.saleTable}
     WHERE ItemID = ? AND IsDeleted = 0 LIMIT 1`,
    [id]
  );

  if (sales.length > 0) {
    throw makeError(409, "Cannot delete an item that has active sales");
  }

  const [result] = await pool.query(
    `UPDATE ${store.itemTable}
     SET IsDeleted = 1, UpdatedAt = NOW()
     WHERE ItemID = ? AND IsDeleted = 0`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw makeError(404, "Item not found");
  }

  return {
    status: 200,
    data: { message: "Item deleted" },
  };
}

// CREATE SALE
async function addSale(params, body, kind) {
  const store = getStore(kind);
  const sale = checkSale(body);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await checkStaff(connection, sale.StaffID, kind);
    const member = await checkMembership(connection, sale.MembershipID);
    const customerID = member ? member.CustomerID : null;

    const [items] = await connection.query(
      `SELECT ItemID, Price
       ${kind === "giftshop" ? ", Stock" : ""}
       FROM ${store.itemTable}
       WHERE ItemID = ? AND IsDeleted = 0
       FOR UPDATE`,
      [sale.ItemID]
    );

    if (items.length === 0) {
      throw makeError(400, "The selected item does not exist");
    }

    const item = items[0];

    if (kind === "giftshop" && sale.Quantity > Number(item.Stock)) {
      throw makeError(400, "Not enough stock for this sale");
    }

    // The Gift Shop INSERT trigger deducts stock automatically.
    await connection.query(
      `INSERT INTO ${store.saleTable}
       (ItemID, SalePrice, Quantity, StaffID, SaleDate,
        PaymentMethod, CreatedAt, UpdatedAt, CreatedBy,
        IsDeleted, MembershipID
        ${kind === "giftshop" ? ", CustomerID" : ""})
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL, 0, ?
        ${kind === "giftshop" ? ", ?" : ""})`,
      [
        sale.ItemID,
        storeSalePrice(
          item.Price,
          member ? member.MembershipType : null,
          kind
        ),
        sale.Quantity,
        sale.StaffID,
        sale.SaleDate,
        sale.PaymentMethod,
        sale.MembershipID,
        ...(kind === "giftshop" ? [customerID] : []),
      ]
    );

    const [ids] = await connection.query(
      "SELECT LAST_INSERT_ID() AS SaleID"
    );

    await connection.commit();

    return {
      status: 201,
      data: await findSale(Number(ids[0].SaleID), kind),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// UPDATE SALE
async function updateSale(params, body, kind) {
  const id = checkId(params);
  const store = getStore(kind);
  const sale = checkSale(body);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [oldRows] = await connection.query(
      `SELECT SaleID, ItemID, Quantity
       FROM ${store.saleTable}
       WHERE SaleID = ? AND IsDeleted = 0
       FOR UPDATE`,
      [id]
    );

    if (oldRows.length === 0) {
      throw makeError(404, "Sale not found");
    }

    const oldSale = oldRows[0];

    await checkStaff(connection, sale.StaffID, kind);
    const member = await checkMembership(connection, sale.MembershipID);
    const customerID = member ? member.CustomerID : null;

    // Lock the old and new item rows in consistent ID order.
    const itemIDs = [...new Set([Number(oldSale.ItemID), sale.ItemID])]
      .sort((a, b) => a - b);

    const [items] = await connection.query(
      `SELECT ItemID, Price
       ${kind === "giftshop" ? ", Stock" : ""}
       FROM ${store.itemTable}
       WHERE ItemID IN (${itemIDs.map(() => "?").join(",")})
         AND IsDeleted = 0
       ORDER BY ItemID
       FOR UPDATE`,
      itemIDs
    );

    const itemMap = new Map(
      items.map((item) => [Number(item.ItemID), item])
    );

    const newItem = itemMap.get(sale.ItemID);

    if (!newItem) {
      throw makeError(400, "The selected item does not exist");
    }

    if (kind === "giftshop") {
      // Restore the old quantity before checking the replacement sale.
      await connection.query(
        `UPDATE ${store.itemTable}
         SET Stock = Stock + ?, UpdatedAt = NOW()
         WHERE ItemID = ?`,
        [Number(oldSale.Quantity), Number(oldSale.ItemID)]
      );

      const [stockRows] = await connection.query(
        `SELECT Stock FROM ${store.itemTable}
         WHERE ItemID = ? FOR UPDATE`,
        [sale.ItemID]
      );

      if (
        stockRows.length === 0 ||
        sale.Quantity > Number(stockRows[0].Stock)
      ) {
        throw makeError(400, "Not enough stock for this sale");
      }

      // UPDATE does not fire the INSERT stock trigger.
      await connection.query(
        `UPDATE ${store.itemTable}
         SET Stock = Stock - ?, UpdatedAt = NOW()
         WHERE ItemID = ?`,
        [sale.Quantity, sale.ItemID]
      );
    }

    await connection.query(
      `UPDATE ${store.saleTable}
       SET ItemID = ?, SalePrice = ?, Quantity = ?,
           StaffID = ?, SaleDate = ?, PaymentMethod = ?,
           MembershipID = ?, UpdatedAt = NOW()
           ${kind === "giftshop" ? ", CustomerID = COALESCE(?, CustomerID)" : ""}
       WHERE SaleID = ? AND IsDeleted = 0`,
      [
        sale.ItemID,
        storeSalePrice(
          newItem.Price,
          member ? member.MembershipType : null,
          kind
        ),
        sale.Quantity,
        sale.StaffID,
        sale.SaleDate,
        sale.PaymentMethod,
        sale.MembershipID,
        ...(kind === "giftshop" ? [customerID] : []),
        id,
      ]
    );

    await connection.commit();

    return {
      status: 200,
      data: await findSale(id, kind),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// SOFT-DELETE SALE
async function deleteSale(params, body, kind) {
  const id = checkId(params);
  const store = getStore(kind);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT SaleID, ItemID, Quantity
       FROM ${store.saleTable}
       WHERE SaleID = ? AND IsDeleted = 0
       FOR UPDATE`,
      [id]
    );

    if (rows.length === 0) {
      throw makeError(404, "Sale not found");
    }

    const sale = rows[0];

    if (kind === "giftshop") {
      await connection.query(
        `UPDATE ${store.itemTable}
         SET Stock = Stock + ?, UpdatedAt = NOW()
         WHERE ItemID = ?`,
        [Number(sale.Quantity), Number(sale.ItemID)]
      );
    }

    await connection.query(
      `UPDATE ${store.saleTable}
       SET IsDeleted = 1, UpdatedAt = NOW()
       WHERE SaleID = ? AND IsDeleted = 0`,
      [id]
    );

    await connection.commit();

    return {
      status: 200,
      data: { message: "Sale deleted" },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function routesFor(kind) {
  const base = `/api/store/${kind}`;

  return [
    {
      method: "GET",
      path: `${base}/items`,
      handler: (params, body) => getItems(params, body, kind),
    },
    {
      method: "POST",
      path: `${base}/items`,
      handler: (params, body) => addItem(params, body, kind),
    },
    {
      method: "PUT",
      path: `${base}/items/:id`,
      handler: (params, body) => updateItem(params, body, kind),
    },
    {
      method: "DELETE",
      path: `${base}/items/:id`,
      handler: (params, body) => deleteItem(params, body, kind),
    },
    {
      method: "GET",
      path: `${base}/sales`,
      handler: (params, body) => getSales(params, body, kind),
    },
    {
      method: "POST",
      path: `${base}/sales`,
      handler: (params, body) => addSale(params, body, kind),
    },
    {
      method: "PUT",
      path: `${base}/sales/:id`,
      handler: (params, body) => updateSale(params, body, kind),
    },
    {
      method: "DELETE",
      path: `${base}/sales/:id`,
      handler: (params, body) => deleteSale(params, body, kind),
    },
  ];
}

module.exports = [
  ...routesFor("giftshop"),
  ...routesFor("cafe"),
];
