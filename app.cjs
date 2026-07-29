// Hostinger Node.js Entry Point (Pure CommonJS, fully synchronous)
// Passenger expects the server to start listening synchronously.
const fs = require("fs");
const path = require("path");

// Write errors to a log file so we can debug via Hostinger File Manager
const logFile = path.join(__dirname, "startup-error.log");

process.on("unhandledRejection", (reason) => {
  const msg = `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n${reason && reason.stack ? reason.stack : ""}\n`;
  fs.appendFileSync(logFile, msg);
  console.error(msg);
});
process.on("uncaughtException", (err) => {
  const msg = `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
  console.error(msg);
});

process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Log startup info
const startupInfo = `[${new Date().toISOString()}] Starting app.cjs\n` +
  `  CWD: ${process.cwd()}\n` +
  `  __dirname: ${__dirname}\n` +
  `  PORT: ${process.env.PORT || "(not set)"}\n` +
  `  NODE_ENV: ${process.env.NODE_ENV}\n` +
  `  Node version: ${process.version}\n`;
fs.writeFileSync(logFile, startupInfo);

// Load the CJS server bundle synchronously — Passenger needs this to be sync
try {
  require("./artifacts/api-server/dist/index.cjs");
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Server loaded successfully\n`);
} catch (err) {
  const msg = `[${new Date().toISOString()}] Failed to require index.cjs: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
  console.error(msg);
  process.exit(1);
}
