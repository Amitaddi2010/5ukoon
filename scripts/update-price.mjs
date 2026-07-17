import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../sqlite.db');

async function main() {
  const sqlite = createClient({ url: `file:${dbPath}` });
  try {
    await sqlite.execute("UPDATE events SET price = '299'");
    console.log("Successfully updated all event prices to 299 in the database.");
  } catch (err) {
    console.log("Database not initialized yet or error occurred: ", err.message);
  }
}

main();
