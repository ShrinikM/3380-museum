const pool = require("./db");
const artistRoutes = require("./routers/artist");
const artworkRoutes = require("./routers/artwork");
const collectionRoutes = require("./routers/collection");
const exhibitionRoutes = require("./routers/exhibition");
const ticketRoutes = require("./routers/ticket");
const membershipRoutes = require("./routers/membership");
const storeRoutes = require("./routers/store");
const staffRoutes = require("./routers/staff");
const reportRoutes = require("./routers/report");
const dashboardRoutes = require("./routers/dashboard");
const donationRoutes = require("./routers/donation");
const alertRoutes = require("./routers/alert");
const customerRoutes = require("./routers/customer");

const allRoutes = artistRoutes.concat(artworkRoutes, collectionRoutes, exhibitionRoutes, ticketRoutes, membershipRoutes, storeRoutes, staffRoutes, reportRoutes, dashboardRoutes, donationRoutes, alertRoutes, customerRoutes);

const databaseErrorCodes = [
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "PROTOCOL_CONNECTION_LOST",
  "ER_ACCESS_DENIED_ERROR",
  "HANDSHAKE_SSL_ERROR",
];

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sendJson(res, status, data){
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function sendError(res, error) {
  if (error.status) {
    sendJson(res, error.status, { error: error.message });
  } else if (databaseErrorCodes.includes(error.code)) {
    console.log("Database error:", error.code, error.message);
    sendJson(res, 503, { error: "Database is unavailable" });
  } else if (error.sqlState === "45000") {
    sendJson(res, 400, { error: error.sqlMessage });
  } else {
    console.log(error);
    sendJson(res, 500, { error: "Something went wrong on the server" });
  }
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    let text = "";

    req.on("data", function (chunk) {
      text = text + chunk;
    });

    req.on("end", function () {
      if (text.trim() === "") {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (error) {
        reject(makeError(400, "Request body must be valid JSON"));
      }
    });
  });
}

const knownStaff = new Map();

async function getActor(req) {
  const username = req.headers["x-username"];

  if (typeof username !== "string" || username.trim() === "") {
    throw makeError(401, "You must be logged in to make changes");
  }

  if (knownStaff.has(username)) {
    return knownStaff.get(username);
  }

  const [rows] = await pool.query(
    "SELECT StaffID FROM staffcredentials WHERE Username = ?",
    [username]
  );

  if (rows.length === 0) {
    throw makeError(401, "Unknown user");
  }

  knownStaff.set(username, rows[0].StaffID);
  return rows[0].StaffID;
}

function matchPath(routePath, requestPath) {
  const routeParts = routePath.split("/");
  const requestParts = requestPath.split("/");

  if (routeParts.length !== requestParts.length) {
    return null;
  }

  const params = {};

  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(":")) {
      params[routeParts[i].slice(1)] = requestParts[i];
    } else if (routeParts[i] !== requestParts[i]) {
      return null;
    }
  }

  return params;
}

function findRoute(method, path) {
  for (const route of allRoutes) {
    if (route.method === method) {
      const params = matchPath(route.path, path);
      if (params !== null) {
        return { route: route, params: params };
      }
    }
  }
  return null;
}

async function handleRequest(req, res) {
  try {
    const path = req.url.split("?")[0];
    const found = findRoute(req.method, path);

    if (found === null) {
      throw makeError(404, "Route not found");
    }

    const query = new URLSearchParams(req.url.split("?")[1] || "");
    for (const [key, value] of query) {
      if (found.params[key] === undefined) {
        found.params[key] = value;
      }
    }

    let body = {};
    if (req.method === "POST" || req.method === "PUT") {
      body = await readBody(req);
      if (typeof body !== "object" || body === null) {
        throw makeError(400, "Request body must be a JSON object");
      }
    }

    let staffId = null;
    if (found.route.needsActor) {
      staffId = await getActor(req);
    }

    const result = await found.route.handler(found.params, body, staffId);
    sendJson(res, result.status, result.data);
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = handleRequest;
