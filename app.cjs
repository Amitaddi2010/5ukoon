// Hostinger LiteSpeed lsnode Entry Point (Pure CommonJS)
// LiteSpeed's lsnode runtime automatically patches http.Server.listen()
// to redirect to the LSAPI socket. We should NOT manually bind to LSNODE_SOCKET.
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

const startupInfo = `[${new Date().toISOString()}] Starting app.cjs (LiteSpeed lsnode)\n` +
  `  CWD: ${process.cwd()}\n` +
  `  __dirname: ${__dirname}\n` +
  `  LSNODE_SOCKET: ${process.env.LSNODE_SOCKET || "(none)"}\n` +
  `  PORT: ${process.env.PORT || "(none, using default 3000)"}\n` +
  `  NODE_ENV: ${process.env.NODE_ENV}\n` +
  `  Node version: ${process.version}\n`;
fs.writeFileSync(logFile, startupInfo);

// Load the CJS server bundle — it calls app.listen(3000)
// lsnode will intercept the listen() call and handle LSAPI protocol
try {
  require("./artifacts/api-server/dist/index.cjs");
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Server loaded successfully (lsnode manages LSAPI socket)\n`);
} catch (err) {
  const msg = `[${new Date().toISOString()}] Failed to require index.cjs: ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(logFile, msg);
  process.exit(1);
}
