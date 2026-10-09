const http = require("http");

process.loadEnvFile(__dirname + "/.env");

const handleRequest = require("./router");

const server = http.createServer(function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  handleRequest(req, res);
});

server.listen(process.env.PORT, function () {
  console.log("Server is running on port " + process.env.PORT);
});
