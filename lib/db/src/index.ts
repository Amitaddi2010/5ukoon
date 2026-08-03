import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

// Resolve db path — on Hostinger, the deploy root contains sqlite.db directly
// The fallback only applies if DATABASE_URL env is not set
const dbPath = path.resolve(process.cwd(), "sqlite.db").replace(/\\/g, '/');
const url = process.env.DATABASE_URL || `file:${dbPath}`;

export const sqlite = createClient({ url });
export const db = drizzle(sqlite, { schema });

export async function ensureDatabaseSchema() {
  try {
    // 1. Create admins table
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // 2. Create events table
    await sqlite.execute(`
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
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // 4. Create attendance_requests table
    await sqlite.execute(`
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
    await sqlite.execute(`
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

    // 6. Create feedbacks table
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        rating INTEGER NOT NULL,
        message TEXT NOT NULL,
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
        await sqlite.execute(sql);
      } catch (e) {
        // Column already exists — safe to ignore
      }
    }
  } catch (err) {
    console.error("⚠️ Failed to ensure database schema:", err);
  }
}

// Run schema initialization asynchronously
ensureDatabaseSchema().catch(() => {});

export * from "./schema";
