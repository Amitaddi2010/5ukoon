import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

const isApiServer = process.cwd().includes("api-server");
const defaultDbPath = isApiServer 
  ? `file:${path.resolve(process.cwd(), "../../lib/db/sqlite.db").replace(/\\/g, '/')}`
  : "file:sqlite.db";
const url = process.env.DATABASE_URL || defaultDbPath;

const sqlite = createClient({ url });
export const db = drizzle(sqlite, { schema });

export * from "./schema";
