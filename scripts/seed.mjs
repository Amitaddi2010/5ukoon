import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { createHash } from "crypto";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Re-define the admin table inline so this script is self-contained
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
  status: text("status", { enum: ["upcoming", "past", "cancelled"] }).notNull().default("upcoming"),
  rsvpLink: text("rsvp_link"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

function hashPassword(password) {
  return createHash("sha256").update(password + "sukoon-salt-2026").digest("hex");
}

async function main() {
  const sqlite = createClient({ url: "file:../../lib/db/sqlite.db" });
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
    console.log(`✅ Admin user created: username="${username}", password="${password}"`);
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint")) {
      console.log(`ℹ️  Admin user "${username}" already exists, skipping.`);
    } else {
      throw err;
    }
  }

  // Seed a sample event
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await db.insert(eventsTable).values({
      title: "Sukoon – Edition 1",
      editionNumber: 1,
      date: futureDate,
      city: "Mumbai",
      venue: "TBD",
      capacity: 25,
      price: "500",
      status: "upcoming",
    });
    console.log("✅ Sample event created: Sukoon – Edition 1");
  } catch (err) {
    console.log("ℹ️  Event may already exist or error:", err.message);
  }

  console.log("\n🎉 Seed complete! You can now log in at /admin with:");
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
}

main().catch(console.error);
