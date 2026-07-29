import app from "./app";
import { logger } from "./lib/logger";

const target = process.env.LSNODE_SOCKET || process.env.PORT || 3000;

app.listen(target as any, () => {
  logger.info({ target }, `Sukoon server listening on ${target}`);
});
