import app from "./app";
import { logger } from "./lib/logger";

const port = process.env.PORT || 3001;

app.listen(port as any, () => {
  logger.info({ port }, "Sukoon server listening");
});
