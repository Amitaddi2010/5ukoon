import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(process.cwd(), 'sqlite.db').replace(/\\/g, '/');
const url = process.env.DATABASE_URL || `file:${dbPath}`;

async function main() {
  const sqlite = createClient({ url });
  try {
    // Attempt to add new columns if they don't exist (SQLite will throw if they already exist, we ignore it)
    try { await sqlite.execute("ALTER TABLE events ADD COLUMN original_price REAL"); } catch (e) {}
    try { await sqlite.execute("ALTER TABLE events ADD COLUMN offer_text TEXT"); } catch (e) {}

    // drizzle mode:"timestamp" stores as Unix SECONDS, not milliseconds
    const eventDateSeconds = Math.floor(new Date("2026-08-01T12:30:00.000Z").getTime() / 1000);
    await sqlite.execute("UPDATE events SET price = 299, date = ?, status = 'past' WHERE edition_number = 1", [eventDateSeconds]);
    console.log("Successfully updated Edition 1 price to 299, date to Saturday Aug 1 2026 @ 6:00 PM IST, status to past.");
  } catch (err) {
    console.log("Database not initialized yet or error occurred: ", err.message);
  }
}

main();
