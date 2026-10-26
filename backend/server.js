const http = require("http");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const handleRequest = require("./router");

const publicDir = path.join(__dirname, "..", "frontend", "dist");
const publicUrl = "https://coogmuseum-bxhea8dad0dwhhhb.westus3-01.azurewebsites.net";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Username, X-Customer-Token");
}

function sendFile(res, filePath) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

function servePublic(req, res) {
  const indexFile = path.join(publicDir, "index.html");

  if (!fs.existsSync(indexFile)) {
    res.writeHead(503, { "Content-Type": "text/plain" });
    res.end("Frontend is not built");
    return;
  }

  const requestPath = decodeURIComponent(req.url.split("?")[0]);
  let relativePath = requestPath;

  if (relativePath === "/") {
    relativePath = "index.html";
  } else {
    relativePath = relativePath.replace(/^[/\\]+/, "");
  }

  const filePath = path.join(publicDir, relativePath);
  const publicRoot = path.resolve(publicDir);

  if (!path.resolve(filePath).startsWith(publicRoot)) {
    res.writeHead(400);
    res.end("Bad path");
    return;
  }

  fs.stat(filePath, function (err, stats) {
    if (!err && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    sendFile(res, indexFile);
  });
}

const server = http.createServer(function (req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split("?")[0];

  if (urlPath.startsWith("/api")) {
    handleRequest(req, res);
    return;
  }

  servePublic(req, res);
});

const port = process.env.PORT || 5001;

server.listen(port, function () {
  console.log("Server is running on port " + port);
  console.log("Public site: " + publicUrl);
});
