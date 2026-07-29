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
      console.log("Admin table notice:", err.message);
    }
  }

  // Next Saturday 6:00 PM calculation
  const now = new Date();
  const daysUntilSat = (6 - now.getDay() + 7) % 7 || 7;
  const satDate = new Date(now);
  satDate.setDate(now.getDate() + daysUntilSat);
  satDate.setHours(18, 0, 0, 0);

  // Seed or update PGIMER Saturday Event
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
      console.log("✅ PGIMER Rooftop Saturday Event created!");
    }
  } catch (err) {
    console.log("ℹ️  Event seed notice:", err.message);
  }

  // Seed sample requests for analytics charts demo
  try {
    const existingReqs = await db.select().from(attendanceRequestsTable);
    if (existingReqs.length < 5) {
      const sampleData = [
        { name: "Dr. Aakash Sharma", phone: "9876543210", email: "aakash.s@pgimer.edu.in", department: "Anaesthesia", attendancePossibility: "Definitely (100%)", status: "approved" },
        { name: "Dr. Priya Verma", phone: "9876543211", email: "priya.v@pgimer.edu.in", department: "Internal Medicine", attendancePossibility: "Definitely (100%)", status: "approved" },
        { name: "Rahul Gupta", phone: "9876543212", email: "rahul.g@pgimer.edu.in", department: "Nursing", attendancePossibility: "Likely (75%)", status: "pending" },
        { name: "Dr. Rohan Malhotra", phone: "9876543213", email: "rohan.m@pgimer.edu.in", department: "Cardiology", attendancePossibility: "Definitely (100%)", status: "approved" },
        { name: "Simran Kaur", phone: "9876543214", email: "simran.k@pgimer.edu.in", department: "Pediatrics", attendancePossibility: "50-50 / Unsure", status: "pending" },
        { name: "Dr. Vikram Singh", phone: "9876543215", email: "vikram.s@pgimer.edu.in", department: "Surgery", attendancePossibility: "Definitely (100%)", status: "pending" },
        { name: "Neha Thakur", phone: "9876543216", email: "neha.t@pgimer.edu.in", department: "Orthopedics", attendancePossibility: "Likely (75%)", status: "waitlisted" },
        { name: "Dr. Ananya Ray", phone: "9876543217", email: "ananya.r@pgimer.edu.in", department: "Anaesthesia", attendancePossibility: "Definitely (100%)", status: "pending" },
      ];

      for (const req of sampleData) {
        await db.insert(attendanceRequestsTable).values({
          eventId: 1,
          ...req,
          createdAt: new Date(),
        });
      }
      console.log("✅ Sample PGIMER registrations seeded for analytics demo.");
    }
  } catch (err) {
    console.log("ℹ️  Sample requests notice:", err.message);
  }

  console.log("\n🎉 Seed complete! Admin login at /admin:");
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
}

main().catch(console.error);
