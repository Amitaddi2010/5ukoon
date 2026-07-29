// Hostinger LiteSpeed / Phusion Passenger Entry Point
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "startup-error.log");

function log(msg) {
  console.log(msg);
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
}

process.on("unhandledRejection", (reason) => {
  const msg = reason && (reason.stack || reason.message || reason);
  log(`Unhandled Rejection: ${msg}`);
});

process.on("uncaughtException", (err) => {
  log(`Uncaught Exception: ${err.message}\n${err.stack}`);
});

process.env.NODE_ENV = process.env.NODE_ENV || "production";
log(`Starting Sukoon Production Server (CWD: ${process.cwd()}, Node: ${process.version})`);

// Synchronously require compiled CJS backend so app.listen() executes during Passenger startup
try {
  const mod = require("./artifacts/api-server/dist/index.cjs");
  global.__sukoon_mod = mod;
  log("Express server loaded synchronously via CJS.");
} catch (err) {
  log(`CJS load error, attempting ESM fallback: ${err.message}`);
  try {
    import("./artifacts/api-server/dist/index.mjs").then((mod) => {
      global.__sukoon_mod = mod;
      log("Express server started via ESM fallback.");
    }).catch((esmErr) => {
      log(`Critical startup failure (ESM): ${esmErr.message}\n${esmErr.stack}`);
    });
  } catch (esmErr) {
    log(`Critical startup failure: ${esmErr.message}\n${esmErr.stack}`);
  }
}
