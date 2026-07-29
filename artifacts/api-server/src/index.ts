import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "3001";
const listenTarget = !isNaN(Number(rawPort)) ? Number(rawPort) : rawPort;

app.listen(listenTarget as any, () => {
  logger.info({ listenTarget }, "Server listening");
});
