// Passenger uses require(), which crashes on ES modules.
// This CommonJS wrapper dynamically imports your ES module app.
async function startApp() {
  await import('./index.mjs');
}
startApp().catch(err => {
  console.error("Failed to start app:", err);
});
