// Hostinger LiteSpeed lsnode Entry Point
// Test: create a bare http.createServer to verify lsnode interception
const http = require("http");
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "startup-error.log");

process.on("unhandledRejection", (reason) => {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`);
});
process.on("uncaughtException", (err) => {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n`);
});

process.env.NODE_ENV = process.env.NODE_ENV || "production";

fs.writeFileSync(logFile, `[${new Date().toISOString()}] Starting app.cjs\n` +
  `  CWD: ${process.cwd()}\n` +
  `  __dirname: ${__dirname}\n` +
  `  LSNODE_SOCKET: ${process.env.LSNODE_SOCKET || "(none)"}\n` +
  `  Node: ${process.version}\n`);

// Step 1: Create a bare http server to test if lsnode intercepts it
const server = http.createServer((req, res) => {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] REQUEST: ${req.method} ${req.url}\n`);

  // Try loading Express app for real requests
  try {
    const app = require("./artifacts/api-server/dist/index.cjs");
  } catch (e) {
    // Already loaded or error — ignore
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Sukoon Server is Running!</h1><p>LiteSpeed lsnode connection verified.</p>");
});

server.listen(3000, () => {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] http.createServer listening on 3000\n`);
});
