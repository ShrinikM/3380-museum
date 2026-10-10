const artistRoutes = require("./routers/artist");
const artworkRoutes = require("./routers/artwork");
const collectionRoutes = require("./routers/collection");

const allRoutes = artistRoutes.concat(artworkRoutes, collectionRoutes);

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
    sendJson(res, 503, { error: "Database is unavailable" });
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

    let body = {};
    if (req.method === "POST" || req.method === "PUT") {
      body = await readBody(req);
      if (typeof body !== "object" || body === null) {
        throw makeError(400, "Request body must be a JSON object");
      }
    }

    const result = await found.route.handler(found.params, body);
    sendJson(res, result.status, result.data);
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = handleRequest;
