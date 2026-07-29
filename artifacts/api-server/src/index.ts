import app from "./app";
import { logger } from "./lib/logger";

// IMPORTANT: Do NOT bind to LSNODE_SOCKET directly.
// Hostinger uses LiteSpeed's lsnode runtime which monkey-patches
// http.Server.listen() to redirect to LSAPI protocol automatically.
// Just listen on a normal port and lsnode handles the rest.
const rawPort = process.env.PORT || process.env.LSNODE_SOCKET || 3000;
const port = typeof rawPort === "string" && !isNaN(Number(rawPort)) ? Number(rawPort) : rawPort;

app.listen(port, () => {
  logger.info({ port }, `Sukoon server listening on ${port}`);
});
