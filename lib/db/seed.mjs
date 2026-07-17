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
      throw err;
    }
  }

  // Seed a sample event
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await db.insert(eventsTable).values({
      title: "Sukoon - Edition 1",
      editionNumber: 1,
      date: futureDate,
      city: "Mumbai",
      venue: "TBD",
      capacity: 25,
      price: "299",
      status: "upcoming",
    });
    console.log("Sample event created: Sukoon - Edition 1");
  } catch (err) {
    console.log("Event may already exist or error:", err.message);
  }

  console.log("\nSeed complete! You can now log in at /admin with:");
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
}

main().catch(console.error);
