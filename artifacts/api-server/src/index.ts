import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "3001";

// Hostinger Passenger may provide a numeric port or a socket path
if (!isNaN(Number(rawPort)) && Number(rawPort) > 0) {
  // Numeric port — bind on 0.0.0.0 so Nginx reverse proxy can reach us
  app.listen(Number(rawPort), "0.0.0.0", () => {
    logger.info({ port: Number(rawPort), host: "0.0.0.0" }, "Server listening");
  });
} else {
  // Socket path — bind directly to the socket file
  app.listen(rawPort as any, () => {
    logger.info({ socket: rawPort }, "Server listening on socket");
  });
}
