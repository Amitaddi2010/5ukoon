import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import path from "path";

const isApiServer = process.cwd().includes("api-server");
const defaultDbPath = isApiServer 
  ? `file:${path.resolve(process.cwd(), "../../lib/db/sqlite.db").replace(/\\/g, '/')}`
  : "file:sqlite.db";

const client = createClient({ url: defaultDbPath });
const db = drizzle(client);

const attendanceRequestsTable = sqliteTable("attendance_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull(),
});

const guestsTable = sqliteTable("guests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: integer("request_id").notNull(),
});

async function clean() {
  const all = await db.select().from(attendanceRequestsTable);
  console.log("Total requests before cleanup:", all.length);

  const seen = new Map();
  const toDelete = [];

  for (const req of all) {
    const key = `${req.eventId}-${req.email.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.set(key, req);
    } else {
      const existing = seen.get(key);
      if (req.status === "approved" && existing.status !== "approved") {
        toDelete.push(existing.id);
        seen.set(key, req);
      } else {
        toDelete.push(req.id);
      }
    }
  }

  console.log("Deleting duplicate request IDs:", toDelete);
  for (const id of toDelete) {
    await db.delete(guestsTable).where(eq(guestsTable.requestId, id));
    await db.delete(attendanceRequestsTable).where(eq(attendanceRequestsTable.id, id));
  }

  const remaining = await db.select().from(attendanceRequestsTable);
  console.log("Total requests after cleanup:", remaining.length);
}

clean().catch(console.error);
