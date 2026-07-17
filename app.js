// This file serves as the entry point for Hostinger's Node.js App server (Phusion Passenger)
// Since Passenger often struggles with ES Modules (.mjs), we use this CommonJS wrapper
// to dynamically import and start the actual API server.

import('./artifacts/api-server/dist/index.mjs')
  .then(() => {
    console.log("Sukoon server successfully started via app.js wrapper");
  })
  .catch((err) => {
    console.error("Failed to start Sukoon server:", err);
  });
