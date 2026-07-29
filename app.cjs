// Hostinger LiteSpeed Node.js Entry Point (Pure CommonJS)
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

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const listenTarget = process.env.LSNODE_SOCKET || process.env.PORT || 3000;

const startupInfo = `[${new Date().toISOString()}] Starting app.cjs (LiteSpeed Node)\n` +
  `  CWD: ${process.cwd()}\n` +
  `  __dirname: ${__dirname}\n` +
  `  LSNODE_SOCKET: ${process.env.LSNODE_SOCKET || "(none)"}\n` +
  `  PORT: ${process.env.PORT || "(none)"}\n` +
  `  TARGET: ${listenTarget}\n` +
  `  NODE_ENV: ${process.env.NODE_ENV}\n` +
  `  Node version: ${process.version}\n`;
fs.writeFileSync(logFile, startupInfo);

// Load the CJS server bundle
try {
  require("./artifacts/api-server/dist/index.cjs");
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Server loaded successfully listening on ${listenTarget}\n`);
} catch (err) {
  const msg = `[${new Date().toISOString()}] Failed to require index.cjs: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
  process.exit(1);
}
