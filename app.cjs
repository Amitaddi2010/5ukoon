// Hostinger LiteSpeed / Phusion Passenger Entry Point
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "startup-error.log");

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`);
  } catch {}
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n`);
  } catch {}
});

process.env.NODE_ENV = process.env.NODE_ENV || "production";

try {
  fs.appendFileSync(
    logFile,
    `[${new Date().toISOString()}] Starting Sukoon Production Server\n` +
      `  CWD: ${process.cwd()}\n` +
      `  __dirname: ${__dirname}\n` +
      `  Node: ${process.version}\n`
  );
} catch {}

async function startServer() {
  try {
    // Run database schema check / init script
    await import("./scripts/init-db.mjs").catch((err) => {
      try {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] DB init notice: ${err.message}\n`);
      } catch {}
    });

    // Import main compiled Express API & static frontend server
    await import("./artifacts/api-server/dist/index.mjs");
    try {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Express server started successfully.\n`);
    } catch {}
  } catch (err) {
    try {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Error starting ES module server, attempting CJS fallback: ${err.message}\n`);
    } catch {}
    try {
      require("./artifacts/api-server/dist/index.cjs");
    } catch (cjsErr) {
      try {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Critical startup failure: ${cjsErr.message}\n${cjsErr.stack}\n`);
      } catch {}
      throw cjsErr;
    }
  }
}

startServer().catch((err) => {
  console.error("Failed to launch Sukoon application:", err);
});
