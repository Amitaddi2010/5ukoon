// Hostinger Node.js Entry Point
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "startup-error.log");

process.on("unhandledRejection", (reason) => {
  const msg = `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n${reason && reason.stack ? reason.stack : ""}\n`;
  fs.appendFileSync(logFile, msg);
});
process.on("uncaughtException", (err) => {
  const msg = `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
});

// Do NOT overwrite process.env.PORT if Hostinger passed a port or socket
const envKeys = Object.keys(process.env).sort().join(", ");
const startupInfo = `[${new Date().toISOString()}] Starting app.cjs\n` +
  `  CWD: ${process.cwd()}\n` +
  `  __dirname: ${__dirname}\n` +
  `  PORT env: ${process.env.PORT || "(undefined)"}\n` +
  `  SERVER_PORT: ${process.env.SERVER_PORT || "(undefined)"}\n` +
  `  PASSENGER_APP_ENV: ${process.env.PASSENGER_APP_ENV || "(undefined)"}\n` +
  `  Node version: ${process.version}\n` +
  `  ENV KEYS: ${envKeys}\n`;
fs.writeFileSync(logFile, startupInfo);

process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Load the CJS server bundle
try {
  require("./artifacts/api-server/dist/index.cjs");
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Server loaded successfully. PORT=${process.env.PORT}\n`);
} catch (err) {
  const msg = `[${new Date().toISOString()}] Failed to require index.cjs: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
  process.exit(1);
}
