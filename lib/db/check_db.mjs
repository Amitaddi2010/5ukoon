import { createClient } from "@libsql/client";

const client = createClient({ url: "file:sqlite.db" });

async function check() {
  const users = await client.execute("SELECT * FROM users");
  const requests = await client.execute("SELECT * FROM attendance_requests");
  const events = await client.execute("SELECT * FROM events");
  console.log("=== USERS ===", users.rows);
  console.log("=== REQUESTS ===", requests.rows);
  console.log("=== EVENTS ===", events.rows);
}

check().catch(console.error);
