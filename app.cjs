// Hostinger Node.js Entry Point wrapper
import("./scripts/init-db.mjs")
  .then(() => {
    return import("./artifacts/api-server/dist/index.mjs");
  })
  .catch((err) => {
    console.error("Failed to start server from app.cjs:", err);
    process.exit(1);
  });
