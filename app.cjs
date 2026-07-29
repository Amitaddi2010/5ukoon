// Hostinger Node.js Entry Point (Pure CommonJS)
const fs = require("fs");
const path = require("path");

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

// Set default PORT to 3000 for Hostinger reverse proxy
process.env.PORT = process.env.PORT || "3000";
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Log startup info
const startupInfo = `[${new Date().toISOString()}] Starting app.cjs\n` +
  `  CWD: ${process.cwd()}\n` +
  `  __dirname: ${__dirname}\n` +
  `  PORT: ${process.env.PORT}\n` +
  `  NODE_ENV: ${process.env.NODE_ENV}\n` +
  `  Node version: ${process.version}\n`;
fs.writeFileSync(logFile, startupInfo);

// Load the CJS server bundle synchronously
try {
  require("./artifacts/api-server/dist/index.cjs");
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Server loaded successfully on port ${process.env.PORT}\n`);
} catch (err) {
  const msg = `[${new Date().toISOString()}] Failed to require index.cjs: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
  console.error(msg);
  process.exit(1);
}
