process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

import("./scripts/init-db.mjs")
  .then(() => {
    return import("./artifacts/api-server/dist/index.mjs");
  })
  .catch((err) => {
    console.error("Failed to start server from app.js:", err);
    process.exit(1);
  });
