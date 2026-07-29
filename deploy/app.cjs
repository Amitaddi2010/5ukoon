// Passenger uses require(), which crashes on ES modules.
// This CommonJS wrapper dynamically imports your ES module app.
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

async function startApp() {
  try {
    const mod = await import('./index.mjs');
    global.__sukoon_mod = mod;
    log("Express server started successfully.");
  } catch (err) {
    log(`Error starting ES module server, attempting CJS fallback: ${err.message}`);
    try {
      const cjsMod = require('./index.cjs');
      global.__sukoon_mod = cjsMod;
      log("Express server started successfully via CJS fallback.");
    } catch (cjsErr) {
      log(`Critical startup failure: ${cjsErr.message}\n${cjsErr.stack}`);
      throw cjsErr;
    }
  }
}

startApp().catch(err => {
  log(`Failed to start app: ${err.message}`);
});
