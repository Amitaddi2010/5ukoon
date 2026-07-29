import { createClient } from "@libsql/client";

const client = createClient({ url: "file:lib/db/sqlite.db" });

async function check() {
  const tables = ["admins", "events", "users", "attendance_requests", "guests"];
  for (const table of tables) {
    const info = await client.execute(`PRAGMA table_info(${table})`);
    console.log(`=== ${table} columns ===`);
    console.log(info.rows.map(r => `${r.name} (${r.type})`).join(", "));
  }
}

check().catch(console.error);
