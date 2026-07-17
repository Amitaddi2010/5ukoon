import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET || "sukoon-local-dev-secret-2026";

// Trust Hostinger's reverse proxy for secure cookies
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? "auto" as any : false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

import path from "path";

app.use("/api", router);

// Serve the compiled frontend static files
const frontendPath = process.env.NODE_ENV === "production" 
  ? path.resolve(__dirname, "public") 
  : path.resolve(__dirname, "../../sukoon/dist/public");
app.use(express.static(frontendPath));

// Fallback all other routes to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.resolve(frontendPath, "index.html"));
});

export default app;
