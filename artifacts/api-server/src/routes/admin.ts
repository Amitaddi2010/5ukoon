import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "sukoon-salt-2026").digest("hex");
}

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.username, username));

    if (!admin || admin.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    (req.session as any).admin = { username: admin.username, name: admin.name };
    return res.json({ username: admin.username, name: admin.name });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/logout
router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /admin/me
router.get("/admin/me", (req, res) => {
  const admin = (req.session as any)?.admin;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });
  return res.json(admin);
});

export default router;
