import app from "./app";
import { logger } from "./lib/logger";

// IMPORTANT: Do NOT bind to LSNODE_SOCKET directly.
// Hostinger uses LiteSpeed's lsnode runtime which monkey-patches
// http.Server.listen() to redirect to LSAPI protocol automatically.
// Just listen on a normal numeric port and lsnode handles the rest.
const port = Number(process.env.PORT) || 3000;

export const server = app.listen(port, () => {
  logger.info({ port }, `Sukoon server listening on port ${port}`);
});

server.on("error", (err: any) => {
  logger.error({ err }, `Server error on port ${port}: ${err.message}`);
});

// Prevent process exit / GC cleanup
(global as any).__sukoon_server = server;

export default app;
