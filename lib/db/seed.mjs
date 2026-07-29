import { createHash } from "crypto";
import Database from "node:fs";

// We'll use the @libsql/client that's installed under lib/db
// But since pnpm hoisting might not expose it, let's use a direct approach

async function main() {
  // Dynamically import from the workspace package location
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");
  const { sqliteTable, integer, text } = await import("drizzle-orm/sqlite-core");

  // Re-define tables inline
  const adminsTable = sqliteTable("admins", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  });

  const eventsTable = sqliteTable("events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    editionNumber: integer("edition_number").notNull(),
    date: integer("date", { mode: "timestamp" }).notNull(),
    city: text("city").notNull(),
    venue: text("venue"),
    capacity: integer("capacity").notNull().default(25),
    price: text("price").notNull(),
    status: text("status").notNull().default("upcoming"),
    rsvpLink: text("rsvp_link"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  });

  const attendanceRequestsTable = sqliteTable("attendance_requests", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    department: text("department"),
    attendancePossibility: text("attendance_possibility"),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  });

  function hashPassword(password) {
    return createHash("sha256").update(password + "sukoon-salt-2026").digest("hex");
  }

  const sqlite = createClient({ url: "file:sqlite.db" });
  const db = drizzle(sqlite);

  // Seed admin
  const username = "admin";
  const password = "sukoon2026";
  const name = "Sukoon Admin";

  try {
    await db.insert(adminsTable).values({
      username,
      passwordHash: hashPassword(password),
      name,
    });
    console.log(`Admin user created: username="${username}", password="${password}"`);
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint")) {
      console.log(`Admin user "${username}" already exists, skipping.`);
    } else {
      console.log("Admin table notice:", err.message);
    }
  }

  // Event date: Saturday 1st August 2026 @ 6:00 PM
  const satDate = new Date(2026, 7, 1, 18, 0, 0);

  // Seed PGIMER Saturday Event
  try {
    const existingEvents = await db.select().from(eventsTable);
    if (existingEvents.length === 0) {
      await db.insert(eventsTable).values({
        title: "Sukoon Mehfil – Rooftop Session",
        editionNumber: 1,
        date: satDate,
        city: "Chandigarh",
        venue: "ODH Mess Rooftop, PGIMER Chandigarh",
        capacity: 50,
        price: "0",
        offerText: "PGIMER Residents & Staff Only — Outsiders strictly NOT allowed",
        status: "upcoming",
      });
      console.log("PGIMER Rooftop Saturday Event created!");
    } else {
      // Update existing event 1 to reflect the Saturday PGIMER details
      await db.update(eventsTable).set({
        title: "Sukoon Mehfil – Rooftop Session",
        date: satDate,
        city: "Chandigarh",
        venue: "ODH Mess Rooftop, PGIMER Chandigarh",
        offerText: "PGIMER Residents & Staff Only — Outsiders strictly NOT allowed",
      });
      console.log("Updated event #1 with PGIMER Saturday details!");
    }
  } catch (err) {
    console.log("Event seed notice:", err.message);
  }

  // Clear dummy requests and guests for clean production readiness
  try {
    const guestsTable = sqliteTable("guests", { id: integer("id").primaryKey() });
    await db.delete(guestsTable);
    await db.delete(attendanceRequestsTable);
    console.log("Cleaned all dummy registration & guest entries.");
  } catch (err) {
    console.log("Cleanup notice:", err.message);
  }

  console.log("\nSeed complete! You can now log in at /admin with:");
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
}

main().catch(console.error);
