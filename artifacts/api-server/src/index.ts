import app from "./app";
import { logger } from "./lib/logger";

const port = process.env.PORT || 3000;

app.listen(port as any, () => {
  logger.info({ port }, `Sukoon server listening on port ${port}`);
});
