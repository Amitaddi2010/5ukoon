// Hostinger Node.js Entry Point (CommonJS)
// Hostinger uses Phusion Passenger which manages the port/socket automatically.
// This file must: 1) initialize the DB, 2) start Express listening on process.env.PORT

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Don't exit — let Passenger handle restarts
});

// Set NODE_ENV for production
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Database was already initialized during the build step (pnpm run build).
// The server bundle handles everything else.

// Use dynamic import to load the ESM server bundle.
// Passenger will wait for the app to start listening before routing traffic.
import("./artifacts/api-server/dist/index.mjs")
  .then(() => {
    console.log("✅ Server started successfully via app.cjs");
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
