// Passenger uses require(), which crashes on ES modules.
// This CommonJS wrapper dynamically imports your ES module app.
process.env.NODE_ENV = process.env.NODE_ENV || "production";

async function startApp() {
  try {
    await import('./index.mjs');
  } catch (err) {
    try {
      require('./index.cjs');
    } catch (cjsErr) {
      console.error("Failed to start app:", cjsErr);
      throw cjsErr;
    }
  }
}
startApp().catch(err => {
  console.error("Failed to start app:", err);
});
