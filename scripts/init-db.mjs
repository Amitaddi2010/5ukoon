import { createClient } from "@libsql/client";
import { createHash } from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dbPath = path.resolve(rootDir, "sqlite.db").replace(/\\/g, "/");
const url = process.env.DATABASE_URL || `file:${dbPath}`;

function hashPassword(password) {
  return createHash("sha256").update(password + "sukoon-salt-2026").digest("hex");
}

async function initDb() {
  console.log(`⚡ Initializing database at: ${url}`);
  const client = createClient({ url });

  try {
    // 1. Create admins table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // 2. Create events table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        edition_number INTEGER NOT NULL,
        date INTEGER NOT NULL,
        city TEXT NOT NULL,
        venue TEXT,
        capacity INTEGER NOT NULL DEFAULT 25,
        price REAL NOT NULL DEFAULT 0,
        original_price REAL,
        offer_text TEXT,
        status TEXT NOT NULL DEFAULT 'upcoming',
        rsvp_link TEXT,
        created_at INTEGER NOT NULL
      );
    `);

    // 3. Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // 4. Create attendance_requests table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS attendance_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        department TEXT,
        social_handle TEXT,
        heard_about TEXT,
        mutual_connection TEXT,
        why_attend TEXT,
        attendance_possibility TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        ticket_code TEXT,
        checked_in INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
    `);

    // 5. Create guests table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        ticket_code TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'confirmed',
        checked_in INTEGER NOT NULL DEFAULT 0,
        checked_in_at INTEGER,
        created_at INTEGER NOT NULL
      );
    `);

    // Column migrations for existing tables created before new features
    const migrations = [
      "ALTER TABLE events ADD COLUMN original_price REAL",
      "ALTER TABLE events ADD COLUMN offer_text TEXT",
      "ALTER TABLE events ADD COLUMN rsvp_link TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN user_id INTEGER",
      "ALTER TABLE attendance_requests ADD COLUMN social_handle TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN heard_about TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN mutual_connection TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN why_attend TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN department TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN attendance_possibility TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN ticket_code TEXT",
      "ALTER TABLE attendance_requests ADD COLUMN checked_in INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE guests ADD COLUMN name TEXT NOT NULL DEFAULT ''",
      "ALTER TABLE guests ADD COLUMN phone TEXT NOT NULL DEFAULT ''",
      "ALTER TABLE guests ADD COLUMN email TEXT NOT NULL DEFAULT ''",
      "ALTER TABLE guests ADD COLUMN ticket_code TEXT NOT NULL DEFAULT ''",
      "ALTER TABLE guests ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed'",
      "ALTER TABLE guests ADD COLUMN checked_in INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE guests ADD COLUMN checked_in_at INTEGER",
    ];

    for (const sql of migrations) {
      try {
        await client.execute(sql);
      } catch (e) {
        // Column already exists — safe to ignore
      }
    }

    // Seed default admin if empty
    const adminCheck = await client.execute("SELECT COUNT(*) as count FROM admins;");
    if (Number(adminCheck.rows[0]?.count || 0) === 0) {
      await client.execute({
        sql: "INSERT INTO admins (username, password_hash, name, created_at) VALUES (?, ?, ?, ?);",
        args: ["admin", hashPassword("sukoon2026"), "Sukoon Admin", Math.floor(Date.now() / 1000)],
      });
      console.log("🟢 Seeded default admin account");
    }

    // Seed default event if empty
    const eventCheck = await client.execute("SELECT COUNT(*) as count FROM events;");
    if (Number(eventCheck.rows[0]?.count || 0) === 0) {
      await client.execute({
        sql: `INSERT INTO events (title, edition_number, date, city, venue, capacity, price, original_price, offer_text, status, rsvp_link, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          "Sukoon Mehfil – Rooftop Session",
          1,
          Math.floor(new Date("2026-08-01T12:30:00Z").getTime() / 1000), // Aug 1 2026 18:00 IST
          "Chandigarh",
          "ODH Mess Rooftop, PGIMER",
          25,
          299,
          499,
          "Early Bird Offer",
          "past",
          null,
          Math.floor(Date.now() / 1000),
        ],
      });
      console.log("🟢 Seeded default Sukoon event");
      
      // Also restore the guests data dynamically
      try {
        const restoreScript = path.resolve(__dirname, 'restore-data.mjs');
        const { execSync } = await import('child_process');
        execSync(`node "${restoreScript}"`, { stdio: 'inherit' });
        console.log("🟢 Successfully restored guest data from Aug 1");
      } catch (e) {
        console.error("🔴 Failed to restore guest data:", e.message);
      }
    }

    console.log("🎉 Database schema & tables initialized successfully.");
  } catch (err) {
    console.error("⚠️ Error initializing DB tables:", err.message);
  }
}

initDb();
