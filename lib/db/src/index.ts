import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

// Always resolve from process.cwd() — on Hostinger, this is the repository root
const dbPath = path.resolve(process.cwd(), "lib/db/sqlite.db").replace(/\\/g, '/');
const url = process.env.DATABASE_URL || `file:${dbPath}`;

const sqlite = createClient({ url });
export const db = drizzle(sqlite, { schema });

export * from "./schema";

