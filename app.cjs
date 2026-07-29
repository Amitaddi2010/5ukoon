// Hostinger CommonJS Entry Point
const { execSync } = require("child_process");

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Initialize database synchronously
try {
  execSync("node scripts/init-db.mjs", { stdio: "inherit" });
} catch (e) {
  console.error("init-db warning:", e.message);
}

// Load CJS server bundle synchronously
try {
  require("./artifacts/api-server/dist/index.cjs");
} catch (err) {
  console.error("Failed to require index.cjs, falling back to ESM import:", err);
  import("./artifacts/api-server/dist/index.mjs");
}
