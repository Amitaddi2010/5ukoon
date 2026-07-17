import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../sqlite.db');

async function main() {
  const sqlite = createClient({ url: `file:${dbPath}` });
  try {
    // Attempt to add new columns if they don't exist (SQLite will throw if they already exist, we ignore it)
    try { await sqlite.execute("ALTER TABLE events ADD COLUMN original_price REAL"); } catch (e) {}
    try { await sqlite.execute("ALTER TABLE events ADD COLUMN offer_text TEXT"); } catch (e) {}

    await sqlite.execute("UPDATE events SET price = '299'");
    console.log("Successfully updated all event prices to 299 in the database.");
  } catch (err) {
    console.log("Database not initialized yet or error occurred: ", err.message);
  }
}

main();
